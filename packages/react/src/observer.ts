import { Component, ComponentClass, FC, forwardRef, ForwardRefExoticComponent, ForwardRefRenderFunction, memo, PureComponent, ReactElement, Ref, useEffect, useRef, useState } from 'react';
import { createComputedRenderer } from './computedRender';
import { ComponentSchedulerHandle, ComponentType, createComponentEffectSchedulerHandle, setCurrentComponentSchedulerHandle } from './schedulers';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<H>>;


const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, P>) => {
	return memo(forwardRef((props: P, ref: Ref<H>) => {
		const [_, setState] = useState(true);

		const componentProps = useRef<{ props: P; ref: Ref<H> }>(null!);
		componentProps.current = { props, ref };

		const schedulerHandle = useRef<ComponentSchedulerHandle>(null!);

		const [state] = useState(() => createComputedRenderer(() => {

			if (!schedulerHandle.current) {
				schedulerHandle.current = setCurrentComponentSchedulerHandle(createComponentEffectSchedulerHandle(ComponentType.observer))!;
				const renderResult = component(componentProps.current.props, componentProps.current.ref);
				setCurrentComponentSchedulerHandle(null);
				return renderResult;
			}

			return component(componentProps.current.props, componentProps.current.ref);
		}, () => {
			schedulerHandle.current.willRender = true;
			setState(p => !p);
		}, ComponentType.observer));

		useEffect(() => state.dispose, []);

		useEffect(() => {
			schedulerHandle.current.componentUpdated();
			schedulerHandle.current.willRender = false;
		})

		return state.render();
	}))
}

function bindObserverClass(instance: any) {
	const renderer = instance.render.bind(instance);
	const baseUnmount = instance.componentWillUnmount?.bind(instance);

	const updater = instance.forceUpdate.bind(instance);

	const state = createComputedRenderer(renderer, updater, ComponentType.observer);

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