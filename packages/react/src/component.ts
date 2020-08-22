import { computed, effect, isReactive, reactive, Calculated, readonly, createTickScheduler } from '@re-active/core';
import { FunctionComponent, useEffect, useMemo, useRef, useState, useContext, forwardRef, useImperativeHandle, Ref, ForwardRefRenderFunction } from 'react';
import { beginRegisterLifecyces, endRegisterLifecycles, LifeCycle } from './lifecycle';

export type Renderer = () => JSX.Element;
export type ReactiveComponent<P = {}> = (props: P) => Renderer;
export type ReactiveComponentWithHandle<P, H> = (props: P, ref: Ref<H>) => Renderer;

export interface ReactiveConfig {
	readonlyProps: boolean;
}

let _config: ReactiveConfig = {
	readonlyProps: false,
};

export function config(cfg: ReactiveConfig) {
	Object.assign(_config, cfg);
}

const useReactiveProps = <P extends { [key: string]: any }>(props: P): P => {

	// convert props to a reactive object
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const reactiveProps = useMemo(() => reactive({...props}), []) as P;
	// keep the old props object for future comparison
	const prevProps = useRef<P>(props);

	// update the reactive props when the component is forced to render
	useEffect(() => {
		const prev = prevProps.current;

		for (const key in props) {
			if (prev[key] !== props[key]) {
				reactiveProps[key] = props[key];
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
		return useMemo(() => readonly(reactiveProps), []) as P;
	}

	// now we return a reactive props object which will also react to parent renders
	return reactiveProps;
}

// a hack to force component re-render
const useForceUpdate = () => {
	const [, forceRender] = useState({});
	return () => forceRender({});
}

const setup = (setupFunction: Function): Renderer => {
	return setupFunction();
}

interface ComponentState {
	computedRender: Calculated<JSX.Element>;
	lifecycles: LifeCycle;
	dispose: () => void;
}

const scheduler = createTickScheduler();

// React.ForwardRefExoticComponent < React.PropsWithoutRef<P> & React.RefAttributes < H >>

// reactive react component implementation
export function createComponent<P = {}>(reactiveComponent: ReactiveComponent<P>): FunctionComponent<P> {

	// creating a functional component
	const ReactiveComponent = <H>(props: P, ref?: Ref<H>) => {
		const reactiveProps = useReactiveProps(props);
		const forceUpdate = useForceUpdate();

		let componentState = useRef<ComponentState>();

		if (!componentState.current) {
			// empty object to be filled with lifecycles
			beginRegisterLifecyces();

			// one time call for the 'reactive component' retrieving the render function which will be called for future renders
			// in this phase we get the lifecycle calls to be referenced in lifecycle phases

			const renderer = setup(() => (reactiveComponent as ReactiveComponentWithHandle<P, H>)(reactiveProps, ref!));

			// keep the ref of the lifecycle obj
			const lifecycles = endRegisterLifecycles();

			// release the lifecycle handle to be used by other components
			// currentLifecycleHandle = null;

			// calling the render function within 'computed' to cache the render and listen to the accessed reactive values.
			const computedRender = computed(() => renderer());

			const renderEffect = effect(() => {
				forceUpdate();
				return computedRender.value;
			}, {
				scheduler,
			});

			const dispose = () => {
				renderEffect.dispose()
				computedRender.dispose();
			}

			componentState.current = {
				computedRender,
				lifecycles,
				dispose,
			};
		} else {
			const { context, imperativeHandler } = componentState.current.lifecycles;
			// call useContext to match hook call order
			for (const ctx of context) {
				useContext(ctx);
			}

			if (imperativeHandler) {
				useImperativeHandle(ref, imperativeHandler);
			}
		}

		const { computedRender, lifecycles, dispose } = componentState.current;

		// call onUpdated
		useEffect(() => {
			lifecycles.onUpdated.forEach(p => p());
		});

		// call onMounted
		useEffect(() => {
			lifecycles.onMounted.forEach(p => p());
			return () => {
				dispose();
				// call onUnmounted
				lifecycles.onUnmounted.forEach(p => p());
			};
		}, [dispose, lifecycles]);

		// return the cached render
		return computedRender.value;
	};

	(ReactiveComponent as any).displayName = reactiveComponent.name || undefined;

	return ReactiveComponent;
}

createComponent.withHandle = <P = {}, H = {}>(reactiveComponent: ReactiveComponentWithHandle<P, H>):
	React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<H>> => {
	return forwardRef(createComponent<P>(reactiveComponent as unknown as ReactiveComponent<P>) as ForwardRefRenderFunction<H, P>);
}