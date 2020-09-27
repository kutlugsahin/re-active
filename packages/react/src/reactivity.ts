import { Box, Computed, computed as coreComputed, ComputedGetterSetter, coreEffect, CoreEffectOptions, Disposer, isBox, ReadonlyComputed, Scheduler, watch as coreWatch, WatchCallback, WatchSource } from '@re-active/core';
import React, { ReactNode } from 'react';
import { onUnmounted } from "./lifecycle";
import { combineSchedulers, ComponentType, getComponentSchedulerHandle, onUpdatedScheduler, tickScheduler } from './schedulers';

let _isStaticRendering = typeof window === 'undefined';

const disposeEffectOnUnmount = (dispose: () => void) => {
	if (!_isStaticRendering) {
		const schedulerHandle = getComponentSchedulerHandle();
		if (schedulerHandle && schedulerHandle.componentType === ComponentType.reactive) {
			onUnmounted(() => {
				dispose();
			});
		}
	}
}

export function computed<T>(getterSetter: ComputedGetterSetter<T>): Computed<T>;
export function computed<T>(fn: () => T): ReadonlyComputed<T>;
export function computed<T>(fnOrGetterSetter: any): any {
	if (_isStaticRendering) {
		return {
			get value() {
				return typeof fnOrGetterSetter === 'function' ? fnOrGetterSetter() : fnOrGetterSetter.get();
			},
			dispose: () => { },
		} as Computed<T>;
	} else {
		const cmp = coreComputed(fnOrGetterSetter);
		disposeEffectOnUnmount(cmp.dispose);
		return cmp;
	}
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
		if (options?.immediate) {
			if (typeof source === 'function') {
				clb((source as () => any)(), undefined);
			} else if (isBox(source)) {
				clb((source as Box<T>).value, undefined);
			} else {
				clb(source as object, undefined);
			}
		}

		return () => { }
	} else {
		let scheduler: Scheduler | undefined = createFlushScheduler(options?.flush || 'post');
		let dispose = coreWatch(source, clb, { ...options, scheduler, flush: undefined });

		disposeEffectOnUnmount(() => {
			dispose();
			scheduler = null!;
			dispose = null!
		})

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

		if (getComponentSchedulerHandle()) {
			onUnmounted(() => {
				eff.dispose();
				scheduler = null!;
				eff = null!
			})
		}

		return eff.dispose
	}
}

export const renderEffect = (computed: Computed<ReactNode | null>, clb: () => void) => {
	if (_isStaticRendering) {
		return () => { };
	} else {
		// schduler to re render component
		const scheduler = tickScheduler();

		let oldValue: any;

		let mounted = false;

		let renderEffect = coreEffect(() => {
			const newValue = computed.value;
			if (mounted && newValue !== oldValue) {
				clb();
			}

			return oldValue = newValue;
		}, { scheduler });

		mounted = true;

		return () => {
			renderEffect.dispose();
			renderEffect = null!;
			oldValue = null;
		};
	}
}

export const isStaticRendering = () => {
	return _isStaticRendering;
}

export const renderStatic = (isStatic: boolean) => {
	// dirty hack to disable warning for static rendering
	// useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://fb.me/react-uselayouteffect-ssr for common fixes.
	React.useLayoutEffect = React.useEffect;

	_isStaticRendering = isStatic;
}