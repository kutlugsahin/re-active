import { Box, Computed, coreEffect, Disposer, isBox, reactive, Reactive, readonly } from '@re-active/core';
import { forwardRef, ForwardRefRenderFunction, FunctionComponent, ReactElement, Ref, useCallback, useContext, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { beginRegisterLifecyces, Callback, ComponentHandle, endRegisterLifecycles, LifeCycle, setCurrentComponentHandle } from './lifecycle';
import { tickScheduler } from './schedulers';
import { computedRender as computed } from './shared';

export type Renderer = () => ReactElement<any, any> | null;
export type ReactiveComponent<P = {}> = (props: Reactive<P>) => Renderer;
export type ReactiveComponentWithHandle<P, H> = (props: Reactive<P>, ref: Ref<H>) => Renderer;

export interface ReactiveConfig {
	readonlyProps: boolean;
}

let _config: ReactiveConfig = {
	readonlyProps: false,
};

export function config(cfg: ReactiveConfig) {
	Object.assign(_config, cfg);
}

const useReactiveProps = <P extends { [key: string]: any }>(props: P) => {

	// convert props to a reactive object
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const { current: reactiveProps } = useRef(reactive({ ...props }));
	// keep the old props object for future comparison
	const prevProps = useRef<P>(props);

	// update the reactive props when the component is forced to render
	useEffect(() => {
		const prev = prevProps.current;

		for (const key in props) {
			if (prev[key] !== props[key]) {
				(reactiveProps[key] as any) = props[key];
			}
		}

		for (const key in reactiveProps) {
			if (key in props === false) {
				reactiveProps[key] = undefined!;
			}
		}

		prevProps.current = props;
	});

	if (_config.readonlyProps) {
		return useMemo(() => readonly(reactiveProps), []);
	}

	// now we return a reactive props object which will also react to parent renders
	return reactiveProps;
}

// a hack to force component re-render
const useForceUpdate = () => {
	const [, forceRender] = useState({});
	return useCallback(() => forceRender({}), [forceRender]);
}

const setup = (setupFunction: Function): Renderer => {
	return setupFunction();
}

interface ComponentState {
	computedRender: Computed<ReactElement<any, any> | null>;
	lifecycles: LifeCycle;
	componentHandle: ComponentHandle;
	dispose: () => void;
}

const createComponentHandle = (): ComponentHandle => {
	let listeners = new Set<Callback>();

	function onUpdated(clb: Callback) {
		listeners.add(clb);

		return () => {
			listeners.delete(clb);
		}
	}

	return {
		willRender: false,
		onUpdated,
		notify() {
			for (const clb of listeners) {
				clb();
			}
			listeners.clear();
		}
	}
}


function setupEffect(componentState: ComponentState, forceUpdate: () => void): Disposer {
	// schduler to re render component
	const scheduler = tickScheduler();

	let mounted = false;

	function update() {
		// call onBeforeRender data is updated but dom is not
		componentState.lifecycles.onBeforeRender.forEach(p => p());
		forceUpdate();
	}

	const renderEffect = coreEffect(() => {
		if (mounted) {
			componentState.componentHandle.willRender = true;
			// re-render react component with tick scheduler
			update();
		}

		return componentState.computedRender.value;
	}, { scheduler });

	mounted = true;

	return renderEffect.dispose;
}

export type ReactiveProps<P extends { [key: string]: any }> = { [key in keyof P]: P[key] | Box<P[key]> }

// reactive react component implementation
export function createComponent<P = {}>(reactiveComponent: ReactiveComponent<P>): FunctionComponent<ReactiveProps<P>> {

	// creating a functional component
	const ReactiveComponent = <H>(props: P, ref?: Ref<H>) => {
		const reactiveProps = useReactiveProps(props);
		const forceUpdate = useForceUpdate();

		let componentState = useRef<ComponentState>();

		if (!componentState.current) {

			// empty object to be filled with lifecycles
			beginRegisterLifecyces();

			// shared object with registered watchers or lifecycles
			const componentHandle = setCurrentComponentHandle(createComponentHandle())!;

			// one time call for the 'reactive component' retrieving the render function which will be called for future renders
			// in this phase we get the lifecycle calls to be referenced in lifecycle phases

			const renderer = setup(() => (reactiveComponent as ReactiveComponentWithHandle<P, H>)(reactiveProps, ref!));

			// keep the ref of the lifecycle obj
			const lifecycles = endRegisterLifecycles();

			setCurrentComponentHandle(null);

			// release the lifecycle handle to be used by other components
			// currentLifecycleHandle = null;

			// calling the render function within 'computed' to cache the render and listen to the accessed reactive values.
			const computedRender = computed(renderer);

			const dispose = () => {
				computedRender.dispose();
			}

			componentState.current = {
				computedRender,
				lifecycles,
				dispose,
				componentHandle,
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

		const { computedRender, lifecycles, dispose, componentHandle } = componentState.current;

		// call onBeforePaint when dom is updated but before actually painted
		useLayoutEffect(() => {
			lifecycles.onBeforePaint.forEach(p => p());
		})

		// call onUpdated
		useEffect(() => {
			lifecycles.onUpdated.forEach(p => p());
			// notify listeners that component is updated
			// i.e watch with flus:'post' option
			componentHandle.notify();

			if (componentHandle.willRender) {
				lifecycles.onRendered.forEach(p => p());
			}

			componentHandle.willRender = false;
		});

		// call onMounted
		useEffect(() => {
			const disposeEffect = setupEffect(componentState.current!, forceUpdate);

			const disposers = lifecycles.onMounted.map(p => p());
			return () => {
				// call on mount disposers
				disposers.forEach(p => {
					if (typeof p === 'function') {
						p();
					}
				});
				dispose();
				disposeEffect();
				// call onUnmounted
				lifecycles.onUnmounted.forEach(p => p());
			};

		}, []);

		// return the cached render
		return computedRender.value;
	};

	(ReactiveComponent as any).displayName = reactiveComponent.name || undefined;

	return ReactiveComponent as FunctionComponent<ReactiveProps<P>>;
}

createComponent.withHandle = <P = {}, H = {}>(reactiveComponent: ReactiveComponentWithHandle<P, H>) => {
	const component = createComponent<P>(reactiveComponent as unknown as ReactiveComponent<P>) as ForwardRefRenderFunction<H, ReactiveProps<P>>;
	return forwardRef(component);
}

