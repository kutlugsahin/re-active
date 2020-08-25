import { Computed, computed as coreComputed, Scheduler, watch as coreWatch, coreEffect } from '@re-active/core';
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

function createFlushScheduler(flush: Flush): Scheduler {
	switch (flush) {
		case 'sync':
			return p => p();
		case 'pre':
			return tickScheduler();
		case 'post':
			return combineSchedulers([tickScheduler(), onUpdatedScheduler()]);
		default:
			return p => p();
	}
}

const watch = <T extends () => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
	let scheduler: Scheduler | undefined = createFlushScheduler(options?.flush || 'post');
	let dispose = coreWatch(fn, clb, { scheduler });

	if (getComponentHandle()) {
		onUnmounted(() => {
			dispose();
			scheduler = null!;
			dispose = null!
		})
	}
}

export interface EffectOptions {
	flush?: Flush;
}

const effect = <T extends () => any>(fn: T, options?: EffectOptions) => {
	let scheduler: Scheduler | undefined = createFlushScheduler(options?.flush || 'post');
	let eff = coreEffect(fn, { scheduler });

	if (getComponentHandle()) {
		onUnmounted(() => {
			eff.dispose();
			scheduler = null!;
			eff = null!
		})
	}
}

export {
	watch,
	computed,
	effect,
};
