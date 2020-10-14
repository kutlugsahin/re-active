import { Computed, coreEffect, isBox, Reactive } from '@re-active/core';
import { forwardRef, ForwardRefRenderFunction, FunctionComponent, memo, ReactElement, Ref, useCallback, useContext, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { beginRegisterLifecyces, endRegisterLifecycles, LifeCycle } from './lifecycle';
import { ReactiveProps, useReactiveProps } from './reactiveProps';
import { computed } from './reactivity';
import { componentRenderScheduler, ComponentSchedulerHandle, ComponentType, createComponentEffectSchedulerHandle, setCurrentComponentSchedulerHandle } from './schedulers';

export type Renderer = () => ReactElement<any, any> | null;
export type ReactiveComponent<P = {}> = (props: Reactive<P>) => Renderer;
export type ReactiveComponentWithHandle<P, H> = (props: Reactive<P>, ref: Ref<H>) => Renderer;

// a hack to force component re-render
const useForceUpdate = () => {
	const [, forceRender] = useState(true);
	return useCallback(() => forceRender(p => !p), [forceRender]);
}

const setup = (setupFunction: Function): Renderer => {
	return setupFunction();
}

interface ComponentState {
	computedRender: Computed<ReactElement<any, any> | null>;
	lifecycles: LifeCycle;
	renderScheduler: ReturnType<typeof componentRenderScheduler>;
	componentHandle: ComponentSchedulerHandle;
	dispose: () => void;
}

// reactive react component implementation
export function createComponentFunction<P = {}>(reactiveComponent: ReactiveComponent<P>): FunctionComponent<ReactiveProps<P>> {

	// creating a functional component
	const ReactiveComponent = <H>(props: P, ref?: Ref<H>) => {
		let componentState = useRef<ComponentState>();
		
		if (componentState.current?.componentHandle.willRender === false) {
			// already rendering by prop change
			// prevent additional update by reactive props
			componentState.current.renderScheduler.noUpdate();
		}

		const reactiveProps = useReactiveProps(props);
		const forceUpdate = useForceUpdate();

		if (!componentState.current) {

			// empty object to be filled with lifecycles
			beginRegisterLifecyces();

			// shared object with registered watchers or lifecycles
			const componentHandle = setCurrentComponentSchedulerHandle(createComponentEffectSchedulerHandle(ComponentType.reactive))!;

			// one time call for the 'reactive component' retrieving the render function which will be called for future renders
			// in this phase we get the lifecycle calls to be referenced in lifecycle phases

			const renderer = setup(() => (reactiveComponent as ReactiveComponentWithHandle<P, H>)(reactiveProps, ref!));

			// keep the ref of the lifecycle obj
			const lifecycles = endRegisterLifecycles();

			// release the lifecycle handle to be used by other components
			setCurrentComponentSchedulerHandle(null);

			function update() {
				componentHandle.willRender = true;
				forceUpdate();
			}

			const renderScheduler = componentRenderScheduler(update);

			// calling the render function within 'computed' to cache the render and listen to the accessed reactive values.
			const computedRender = computed(renderer);

			const renderEffectDispose = coreEffect(() => computedRender.value, {
				scheduler: renderScheduler.scheduler
			});

			const dispose = () => {
				computedRender.dispose();
				renderEffectDispose.dispose();
			}

			componentState.current = {
				computedRender,
				lifecycles,
				dispose,
				componentHandle,
				renderScheduler,
			};
		} else {
			const { context, imperativeHandler } = componentState.current.lifecycles;
			// call useContext to match hook call order
			for (const [ctx, boxedValue] of context) {
				const value = useContext(ctx);
				boxedValue.value = isBox(value) ? value.value : value;
			}

			if (imperativeHandler) {
				useImperativeHandle(ref, imperativeHandler);
			}
		}

		const { computedRender, lifecycles, dispose, componentHandle, renderScheduler } = componentState.current;

		// call onBeforePaint when dom is updated but before actually painted
		useLayoutEffect(() => {
			lifecycles.onBeforePaint.forEach(p => p());
		})

		// call onMounted
		useEffect(() => {
			const disposers = lifecycles.onMounted.map(p => p());

			return () => {
				// call on mount disposers
				disposers.forEach(p => {
					if (typeof p === 'function') {
						p();
					}
				});
				dispose();
				// disposeEffect();
				// call onUnmounted
				lifecycles.onUnmounted.forEach(p => p());
			};

		}, []);

		// call onUpdated
		useEffect(() => {
			lifecycles.onUpdated.forEach(p => p());
			// notify listeners that component is updated
			// i.e watch with flus:'post' option
			componentHandle.componentUpdated();

			componentState.current!.componentHandle.willRender = false;
		});

		// run the latest renderer effect job to recalculate and cache render
		renderScheduler.runEffect();

		// return the cached render
		return computedRender.value;
	};

	(ReactiveComponent as any).displayName = reactiveComponent.name || undefined;

	return ReactiveComponent as FunctionComponent<ReactiveProps<P>>;
}

export function createComponent<P = {}>(reactiveComponent: ReactiveComponent<P>): FunctionComponent<ReactiveProps<P>> {
	return memo(createComponentFunction(reactiveComponent));
}

createComponent.withHandle = <P = {}, H = {}>(reactiveComponent: ReactiveComponentWithHandle<P, H>) => {
	const component = createComponentFunction<P>(reactiveComponent as unknown as ReactiveComponent<P>) as ForwardRefRenderFunction<H, ReactiveProps<P>>;
	return memo(forwardRef(component));
}

