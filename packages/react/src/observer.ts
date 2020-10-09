import { box, coreEffect } from '@re-active/core';
import { Component, ComponentClass, FC, forwardRef, ForwardRefExoticComponent, ForwardRefRenderFunction, memo, PureComponent, ReactElement, Ref, useEffect, useRef, useState } from 'react';
import { ReactiveProps } from './reactiveProps';
import { computed } from './reactivity';
import { componentRenderScheduler } from './schedulers';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<ReactiveProps<P>> & React.RefAttributes<H>>;

type Renderer = () => ReactElement | null;
type Updater = () => void;

const getComputedRenderState = (renderComponent: Renderer, forceUpdate: Updater) => {
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

function renderComputed(renderer: Renderer, updater: Updater) {
	let state: ReturnType<typeof getComputedRenderState>;

	return {
		render() {
			if (!state) {
				state = getComputedRenderState(renderer, updater);
				return state.render.value;
			};

			const { render, runEffect, invalidate, isRenderingByEffect } = state;

			if (isRenderingByEffect) {
				runEffect();
				state.isRenderingByEffect = false;
			} else {
				invalidate();
			}

			return render.value;
		},
		dispose() {
			state.dispose();
		}
	}
}

const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, P>) => {
	return memo(forwardRef((props: P, ref: Ref<H>) => {
		const [_, setState] = useState(true);

		const componentProps = useRef({ props, ref });
		const [state] = useState(() => renderComputed(() => {
			return component(componentProps.current.props, componentProps.current.ref);
		}, () => setState(p => !p)))

		useEffect(() => state.dispose, []);

		return state.render();
	}))
}

function bindObserverClass(instance: any) {
	const renderer = instance.render.bind(instance);
	const baseUnmount = instance.componentWillUnmount?.bind(instance);

	const updater = instance.forceUpdate.bind(instance);

	const state = renderComputed(renderer, updater);

	instance.render = state.render;

	instance.componentWillUnmount = () => {
		state.dispose();
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