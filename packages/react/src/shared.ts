import { Computed, computed as coreComputed, Scheduler, watch as coreWatch, coreEffect, Disposer, WatchSource, WatchCallback, CoreEffectOptions, Box } from '@re-active/core';
import { ReactElement, ReactNode } from 'react';
import { getComponentHandle, onUnmounted } from "./lifecycle";
import { combineSchedulers, onUpdatedScheduler, tickScheduler } from './schedulers';

let _isStaticRendering = false;

const disposeEffectOnUnmount = (dispose: () => void) => {
	if (getComponentHandle()) {
		onUnmounted(() => {
			dispose();
		});
	}
}

export const computed = <T>(fn: () => T): Computed<T> => {
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

export function watch<T>(source: Box<T>, clb: WatchCallback<T>, options?: WatchOptions): Disposer;
export function watch<T>(source: () => T, clb: WatchCallback<T>, options?: WatchOptions): Disposer;
export function watch<T>(source: Computed<T>, clb: WatchCallback<T>, options?: WatchOptions): Disposer;
export function watch<T extends object>(source: T, clb: WatchCallback<T>, options?: WatchOptions): Disposer;
export function watch<T extends WatchSource>(source: T, clb: WatchCallback<any>, options?: WatchOptions): Disposer {
	if (_isStaticRendering) {
		return () => {}
	} else {
		let scheduler: Scheduler | undefined = createFlushScheduler(options?.flush || 'post');
		let dispose = coreWatch(source, clb, { ...options, scheduler, flush: undefined });

		if (getComponentHandle()) {
			onUnmounted(() => {
				dispose();
				scheduler = null!;
				dispose = null!
			})
		}

		return dispose;
	}
}

export interface EffectOptions extends Omit<CoreEffectOptions, 'scheduler'> {
	flush?: Flush;
}

export const effect = <T extends () => any>(fn: T, options?: EffectOptions): Disposer => {
	if (_isStaticRendering) {
		fn();
		return () => void 0;
	} else {
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
}

export const computedRender = <T>(fn: () => T): Computed<T> => {
	if (_isStaticRendering) {
		return {
			value: fn(),
			dispose: () => { },
		} as Computed<T>;
	} else {
		const cmp = coreComputed(fn);
		disposeEffectOnUnmount(cmp.dispose);
		return cmp;
	}
}

export const renderEffect = (computed: Computed<ReactNode | null>, clb: () => void) => {
	// schduler to re render component
	const scheduler = tickScheduler();

	let mounted = false;

	const renderEffect = coreEffect(() => {
		if (mounted) {
			clb();
		}
		
		return computed.value;
	}, { scheduler });
	
	mounted = true;

	return renderEffect.dispose;
}

export const isStaticRendering = () => {
	return _isStaticRendering;
}

export const renderStatic = (isStatic: boolean) => {
	_isStaticRendering = isStatic;
}