import { Computed, Disposer, Reactive } from '@re-active/core';
import { Component, ComponentClass, FC, forwardRef, ForwardRefExoticComponent, ForwardRefRenderFunction, memo, PropsWithChildren, PureComponent, ReactElement, ReactNode, Ref, useEffect, useRef, useState } from 'react';
import { ReactiveProps, useReactiveProps } from './reactiveProps';
import { computed, renderEffect } from './reactivity';
import { ComponentSchedulerHandle, ComponentType, createComponentEffectSchedulerHandle, setCurrentComponentSchedulerHandle } from './schedulers';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<ReactiveProps<P>> & React.RefAttributes<H>>;

interface ComponentState<P> {
	computedRender: Computed<React.ReactElement<any, any> | null>;
	renderEffectDisposer: Disposer;
	componentHandle: ComponentSchedulerHandle;
	reactiveProps: Reactive<P>,
}

const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, Reactive<P>>) => {

	return memo(forwardRef((props: PropsWithChildren<P>, ref: Ref<H>) => {
		const [_, setState] = useState({});
		const componentState = useRef<ComponentState<P> | null>(null);

		const reactiveProps = useReactiveProps(props);

		useEffect(() => {
			if (componentState.current) {
				componentState.current.componentHandle.componentUpdated();
				componentState.current.componentHandle.willRender = false;
			}

			return () => {
				componentState.current?.computedRender.dispose();
				componentState.current?.renderEffectDisposer();
				componentState.current = null;
			}
		 }, []);

		// first time setup computed render and effect
		if (!componentState.current) {
			// shared object with registered watchers or lifecycles
			const componentHandle = setCurrentComponentSchedulerHandle(createComponentEffectSchedulerHandle(ComponentType.observer))!;
			// componentHandle.willRender = false;

			const computedRender = computed(() => {
				const componentProps = componentState.current?.reactiveProps || reactiveProps;
				return component(componentProps as any, ref)
			});
			
			setCurrentComponentSchedulerHandle(null);

			const renderEffectDisposer = renderEffect(computedRender, () => {
				componentState.current!.componentHandle.willRender = true;
				setState({});
			});

			componentState.current = {
				computedRender,
				renderEffectDisposer,
				reactiveProps,
				componentHandle,
			}
		} else {
			// update prop ref to be used in the computed function
			componentState.current.reactiveProps = reactiveProps;

			// // skip component render since reactive dep update. 
			// if (!componentState.current.componentHandle.willRender) {
			// 	// update not because reacive prop change so render component directly
			// 	return component(props, ref);
			// }
		}
		
		componentState.current.componentHandle.willRender = false;
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
		renderEffectDisposer = null!;
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
}) as FC<ObserverProps>;