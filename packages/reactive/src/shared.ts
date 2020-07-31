import { computed as vendorComputed, ReactiveEffect, effect, stop, reactive as vendorReactive, UnwrapRef, ref as vendorRef, ComputedRef } from "@vue/reactivity";
import { isInSetupPhase, onUnmounted } from "./lifecycle";

type Reactive<T> = T extends object ? T : { value: T }

export 	const disposeEffectOnUnmount = (effect: ReactiveEffect) => {
	if (isInSetupPhase()) {
		onUnmounted(() => {
			stop(effect);
		});
	}
}

const ref = <T>(val: T): { value: T } => {
	const observed = vendorRef<T>(val);
	return {
		get value() {
			return observed.value as T
		},
		set value(v: T) {
			observed.value = v as UnwrapRef<T>;
		}
	}
}

export const reactive = <T>(val: T): Reactive<T> => {
	const type = typeof val;

	switch (type) {
		case 'object':
			return vendorReactive(val as any) as Reactive<T>;
		case 'bigint':
		case 'number':
		case 'string':
		case 'boolean': {
			return ref(val) as Reactive<T>
		}
		default:
			return vendorReactive(val as any) as Reactive<T>;
	}
}

export type Calculated<T> = {
	value: T,
	watch: (listener: (olVal: T, newVal: T) => void) => () => void
	isActive: boolean
}

export type Computed<F extends () => any> = Calculated<ReturnType<F>>;

export const computed = <T extends () => any>(fn: T): Computed<T> => {
	const cmp = vendorComputed(fn);

	disposeEffectOnUnmount(cmp.effect);

	return {
		get value() {
			return cmp.value;
		},
		watch: (clb) => watch(() => cmp.value, clb),
		get isActive() {
			return cmp.effect.active
		},
	}
}

function makeReactiveProps(arr: any[]) {
	let state: { [key: number]: any } = {};
	arr.forEach((p, i) => {
		state[i] = p;
	});
	return reactive(state);
}

function updateReactiveProps(props: any[], state: any) {
	props.forEach((p, i) => {
		state[i] = p;
	});
}

export const computedFn = <T extends (...p: any[]) => any>(fn: T): T => {
	let isInited = false;
	let computed: ComputedRef<ReturnType<T>>;
	let reactiveProps: {[key:string]: any};

	return ((...p: Parameters<T>): ReturnType<T> => {
		if (!isInited) {
			reactiveProps = makeReactiveProps(p);
			computed = vendorComputed(() => {
				const params = Object.keys(reactiveProps).map(p => reactiveProps[p]);
				return fn(...params);
			})
		} else {
			updateReactiveProps(p, reactiveProps);
		}

		return computed.value;
	}) as T;
}

export interface WatchOptions {
	immediate?: boolean;
	scheduler?: (job: ReactiveEffect<any>) => void;
}

export const watch = <T extends () => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
	const computedVal = vendorComputed(fn);
	let oldValue: ReturnType<T>;
	let newValue: ReturnType<T>;

	const eff = effect(() => {
		oldValue = newValue;
		newValue = computedVal.value;
		clb(newValue, oldValue);
	}, {
		lazy: false,
		scheduler: options?.scheduler,
	})

	const dispose = () => {
		stop(eff);
		stop(computedVal.effect);
	}

	if (isInSetupPhase()) {
		onUnmounted(() => {
			dispose();
		})
	}

	return dispose;
}

export const createTickScheduler = () => {
	let isRunning = false;
	return (job: ReactiveEffect<any>) => {
		if (!isRunning) {
			isRunning = true;

			Promise.resolve().then(() => {
				job();
				isRunning = false;
			})
		}
	}
}