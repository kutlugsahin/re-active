import { box, Computed, coreEffect, Disposer, Reactive } from '@re-active/core';
import { Component, ComponentClass, FC, forwardRef, ForwardRefExoticComponent, ForwardRefRenderFunction, memo, PropsWithChildren, PureComponent, ReactElement, ReactNode, Ref, useEffect, useMemo, useRef, useState } from 'react';
import { ReactiveProps, useReactiveProps } from './reactiveProps';
import { computed, renderEffect } from './reactivity';
import { componentRenderScheduler, ComponentSchedulerHandle, ComponentType, createComponentEffectSchedulerHandle, setCurrentComponentSchedulerHandle } from './schedulers';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<ReactiveProps<P>> & React.RefAttributes<H>>;

interface ComponentState<P> {
	computedRender: Computed<React.ReactElement<any, any> | null>;
	renderEffectDisposer: Disposer;
	componentHandle: ComponentSchedulerHandle;
	reactiveProps: Reactive<P>,
}

const getComputedRenderState = (renderComponent: () => any, forceUpdate: () => void) => {
	let _isRenderingByEffect = false;

	const scheduler = componentRenderScheduler(() => {
		_isRenderingByEffect = true;
		forceUpdate();
	});

	const reactiveInvalidate = box.shallow({});

	const invalidate = () => {
		scheduler.runImmediate();
		reactiveInvalidate.value = {};
	}

	let render = computed(() => {
		reactiveInvalidate.value;
		return renderComponent();
	});

	let effect = coreEffect(() => render.value, {
		scheduler: scheduler.scheduler
	})

	return {
		render,
		get isRenderingByEffect() {
			return _isRenderingByEffect;
		},
		set isRenderingByEffect(val: boolean) {
			_isRenderingByEffect = val;
		},
		runEffect: scheduler.runEffect,
		invalidate,
		dispose() {
			render.dispose();
			effect.dispose();
			render = null!;
			effect = null!;
		}
	}
}

const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, P>) => {
	return memo(forwardRef((props: P, ref: Ref<H>) => {
		const [_, setState] = useState(true);

		const componentProps = useRef({ props, ref });
		const state = useRef<ReturnType<typeof getComputedRenderState>>();

		useEffect(() => {
			return state.current!.dispose;
		}, []);


		if (!state.current) {
			state.current = getComputedRenderState(() => {
				return component(componentProps.current.props, componentProps.current.ref);
			}, () => setState(p => !p));

			return state.current.render.value;
		} else {
			componentProps.current = {
				props, ref
			};
		}

		const { render, runEffect, invalidate, isRenderingByEffect } = state.current;

		if (isRenderingByEffect) {
			runEffect();
			state.current.isRenderingByEffect = false;
		} else {
			invalidate();
		}

		return render.value;
	}))
}

function bindObserverClass(instance: any) {
	const renderer = instance.render.bind(instance);
	const baseUnmount = instance.componentWillUnmount?.bind(instance);
	let computedRenderState: ReturnType<typeof getComputedRenderState>;

	const updater = instance.forceUpdate.bind(instance);

	instance.render = () => {
		if (!computedRenderState) {
			computedRenderState = getComputedRenderState(renderer, updater);
			return computedRenderState.render.value;
		}

		const { render, runEffect, invalidate, isRenderingByEffect } = computedRenderState

		if (isRenderingByEffect) {
			runEffect();
			computedRenderState.isRenderingByEffect = false;
		} else {
			invalidate();
		}

		return render.value;
	}

	instance.componentWillUnmount = () => {
		computedRenderState.dispose();
		baseUnmount?.();
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