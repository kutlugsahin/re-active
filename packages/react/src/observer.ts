import { Computed, Disposer } from '@re-active/core';
import { Component, ComponentClass, FC, forwardRef, ForwardRefExoticComponent, ForwardRefRenderFunction, memo, PropsWithChildren, PureComponent, ReactElement, ReactNode, Ref, useEffect, useRef, useState } from 'react';
import { computedRender as computed, renderEffect } from './shared';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<H>>;

interface ComponentState<P> {
	computedRender: Computed<React.ReactElement<any, any> | null>;
	renderEffectDisposer: Disposer;
	props: P,
	willInvalidate: boolean;
}

const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, P>) => {

	return memo(forwardRef((props: PropsWithChildren<P>, ref: Ref<H>) => {
		const [_, setState] = useState({});
		const componentState = useRef<ComponentState<P> | null>(null);

		useEffect(() => {
			return () => {
				componentState.current?.computedRender.dispose();
				componentState.current?.renderEffectDisposer();
				componentState.current = null;
			}
		 }, []);

		// first time setup computed render and effect
		if (!componentState.current) {
			const computedRender = computed(() => {
				const componentProps = componentState.current?.props || props;
				return component(componentProps, ref)
			});

			const renderEffectDisposer = renderEffect(computedRender, () => {
				componentState.current!.willInvalidate = true;
				setState({});
			})

			componentState.current = {
				computedRender,
				renderEffectDisposer,
				props,
				willInvalidate: true,
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
	let renderEffectDisposer: Disposer;
	let willInvalidate = true;

	const renderer = instance.render.bind(instance);
	const baseMount = instance.componentDidMount?.bind(instance);
	const baseUnmount = instance.componentWillUnmount?.bind(instance);

	instance.render = () => {
		if (!computedRender) {
			computedRender = computed(renderer);

			renderEffectDisposer = renderEffect(computedRender, () => {
				willInvalidate = true;
				instance.forceUpdate();
			})
		}

		if (willInvalidate) {
			willInvalidate = false;
			return computedRender.value;
		} else {
			return renderer();
		}
	}

	instance.componentDidMount = () => {
		baseMount?.();
	}

	instance.componentWillUnmount = () => {
		baseUnmount?.();
		computedRender?.dispose();
		computedRender = null;
		renderEffectDisposer();
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