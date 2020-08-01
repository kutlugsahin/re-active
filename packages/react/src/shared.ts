import { Computed, computed as coreComputed, watch as coreWatch, WatchOptions, reactive, computedFn, createTickScheduler } from '@re-active/core';
import { isInSetupPhase, onUnmounted } from "./lifecycle";

const disposeEffectOnUnmount = (dispose: () => void) => {
	if (isInSetupPhase()) {
		onUnmounted(() => {
			dispose();
		});
	}
}

const computed = <T extends () => any>(fn: T): Computed<T> => {
	const cmp = coreComputed(fn);
	disposeEffectOnUnmount(cmp.dispose);
	return cmp;
}

const watch = <T extends () => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
	const dispose = coreWatch(fn, clb, options);

	if (isInSetupPhase()) {
		onUnmounted(() => {
			dispose();
		})
	}

	return dispose;
}

export {
	watch,
	computed,
	reactive,
	computedFn,
	createTickScheduler,
}