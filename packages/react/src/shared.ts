import { Computed, computed as coreComputed, Scheduler, watch as coreWatch, coreEffect, Disposer, WatchSource, WatchCallback, CoreEffectOptions } from '@re-active/core';
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

export interface WatchOptions extends Omit<CoreEffectOptions, 'scheduler'> {
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

const watch = <T extends WatchSource>(fn: T, clb: WatchCallback<T>, options?: WatchOptions): Disposer => {
	let scheduler: Scheduler | undefined = createFlushScheduler(options?.flush || 'post');
	let dispose = coreWatch(fn, clb, { ...options, scheduler, flush: undefined });

	if (getComponentHandle()) {
		onUnmounted(() => {
			dispose();
			scheduler = null!;
			dispose = null!
		})
	}

	return dispose;
}

export interface EffectOptions extends Omit<CoreEffectOptions, 'scheduler'> {
	flush?: Flush;
}

const effect = <T extends () => any>(fn: T, options?: EffectOptions): Disposer => {
	let scheduler: Scheduler | undefined = createFlushScheduler(options?.flush || 'post');
	let eff = coreEffect(fn, { ...options, scheduler });

	if (getComponentHandle()) {
		onUnmounted(() => {
			eff.dispose();
			scheduler = null!;
			eff = null!
		})
	}

	return eff.dispose
}

export {
	watch,
	computed,
	effect,
};
