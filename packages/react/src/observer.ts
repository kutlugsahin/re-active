import { Computed, computed, coreEffect, reactive, Effect, Disposer } from '@re-active/core';
import { FC, useRef, createElement, memo, PropsWithChildren, useState, useEffect, useMemo, ForwardRefExoticComponent, forwardRef, Ref, ForwardRefRenderFunction, useCallback, ClassicComponent, PureComponent, ComponentType, ComponentClass, Component, ReactNode, ReactElement } from 'react';
import { tickScheduler } from './schedulers';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<H>>;

interface ComponentState<P> {
	computedRender: Computed<React.ReactElement<any, any> | null>;
	props: P,
	willInvalidate: boolean;
}

function setupRenderEffect<P>(componentState: ComponentState<P>, setState: (s: any) => void): Disposer {
	let mounted = false;

	const renderEffect = coreEffect(() => {
		if (mounted) {
			// reactive dependency changed set flag
			componentState.willInvalidate = true;
			setState({});
		}
		return componentState.computedRender.value;
	}, {
		scheduler: tickScheduler()
	})

	mounted = true;

	return renderEffect.dispose;
}

const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, P>) => {

	return memo(forwardRef((props: PropsWithChildren<P>, ref: Ref<H>) => {
		const [_, setState] = useState({});
		const componentState = useRef<ComponentState<P> | null>(null);

		useEffect(() => {
			const renderEffectDisposer = setupRenderEffect(componentState.current!, setState);

			return () => {
				componentState.current?.computedRender.dispose();
				renderEffectDisposer();
				componentState.current = null;
			}
		 }, []);

		// first time setup computed render and effect
		if (!componentState.current) {
			const computedRender = computed(() => {
				const componentProps = componentState.current?.props || props;
				return component(componentProps, ref)
			});

			componentState.current = {
				computedRender,
				props,
				willInvalidate: false,
			}
		} else {
			// update prop ref to be used in the computed function
			componentState.current.props = props;

			// skip component render since reactive dep update. 
			if (!componentState.current.willInvalidate) {
				// update not because reacive prop change so render component directly
				return component(props, ref);
			}

			componentState.current.willInvalidate = false;
		}

		// reactive dept has changed, willInvalidate was true -> computed function will run
		return componentState.current.computedRender.value;
	}))
}

function bindObserverClass(instance: any) {
	let computedRender: Computed<ReactNode> | null = null;
	let renderEffect: Effect | null;
	let mounted = false;
	let willInvalidate = false;

	const renderer = instance.render.bind(instance);
	const baseMount = instance.componentDidMount?.bind(instance);
	const baseUnmount = instance.componentWillUnmount?.bind(instance);

	instance.render = () => {
		if (!computedRender) {
			computedRender = computed(renderer);
		}

		if (willInvalidate) {
			willInvalidate = false;
			return computedRender.value;
		} else {
			return renderer();
		}
	}

	instance.componentDidMount = () => {
		renderEffect = coreEffect(() => {
			if (mounted) {
				willInvalidate = true;
				instance.forceUpdate();
			}

			return computedRender?.value;
		}, {
			scheduler: tickScheduler()
		})

		mounted = true;
		baseMount?.();
	}

	instance.componentWillUnmount = () => {
		mounted = false;
		baseUnmount?.();
		computedRender?.dispose();
		computedRender = null;
		renderEffect?.dispose();
		renderEffect = null;
	}
}

const observerClass = <P>(component: ComponentClass<P>): typeof component => {
	class ObserverClass extends component {
		constructor(props: P, context?: any) {
			super(props, context);
			bindObserverClass(this);
		}
	}

	if (component.prototype instanceof PureComponent) {
		return ObserverClass;
	}

	return memo(ObserverClass) as unknown as typeof component;
}

export function observer<P, T extends ComponentClass<P>>(component: T): T;
export function observer<P, H>(component: ForwardRefRenderFunction<H, P>): ObserverFunctionalComponent<P, H>;
export function observer(component: any): any {
	let resultingComponent;

	if (component.prototype instanceof Component) {
		resultingComponent = observerClass(component);
	} else {
		resultingComponent = observerFunction(component);
	}

	resultingComponent.displayName = component.displayName || component.nane || 'ObserverComponent';

	return resultingComponent;
}

export class ObserverComponent<P = {}, S = {}> extends PureComponent<P, S> {
	constructor(props: P) {
		super(props);
		bindObserverClass(this);
	}
}

export interface ObserverProps {
	children: () => ReactElement;
}

export const Observer: FC<ObserverProps> = observer((props: ObserverProps) => {
	return props.children();
})