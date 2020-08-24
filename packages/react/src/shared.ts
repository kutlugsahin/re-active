import { Computed, computed as coreComputed, computedFn, effect, Scheduler } from '@re-active/core';
import { getComponentHandle, onUnmounted } from "./lifecycle";
import { combineSchedulers, onUpdatedScheduler, tickScheduler } from './schedulers';

const disposeEffectOnUnmount = (dispose: () => void) => {
	if (getComponentHandle()) {
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



export type Flush = 'pre' | 'post' | 'sync';

export interface WatchOptions {
	flush?: Flush;
	immediate?: boolean
}

function createWatchScheduler<T>(flush: Flush, clb: (newValue: T, oldValue: T) => void) {
	let oldValue: T;
	let scheduler: Scheduler;

	switch (flush) {
		case 'sync':
			scheduler = p => p();
			break;
		case 'pre':
			scheduler = tickScheduler();
			break;
		case 'post':
			scheduler = combineSchedulers([tickScheduler(), onUpdatedScheduler()]);
			break;
		default:
			scheduler = p => p();
	}

	return (newValue: T) => {
		scheduler(() => {
			clb(newValue, oldValue);
			oldValue = newValue;
		})
	}
}

const watch = <T extends () => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
	const scheduler = createWatchScheduler(options?.flush || 'post', clb);
	let shouldRun = false;
	let watchEffect = effect(() => {
		const newValue = fn();
		if (options?.immediate) {
			shouldRun = true;
		}

		if (shouldRun) {
			scheduler(newValue);
		} else {
			shouldRun = true;
		}
	})

	if (getComponentHandle()) {
		onUnmounted(() => {
			watchEffect.dispose();
			watchEffect = undefined!;
		})
	}
}

export {
	watch,
	computed,
	computedFn,
};
