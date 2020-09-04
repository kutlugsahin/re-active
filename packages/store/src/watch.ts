import { reactive, watch, CoreWatchOptions, CoreEffectOptions, coreEffect, WatchCallback, Disposer, Scheduler, tickScheduler } from '@re-active/core';
import { getGlobalStore } from './createStore';

let _actionWatcher: ActionWatcher;

export type ActionWatcher = (actionName: string, parameters: any[], result: any) => Promise<void> | void;


export const watchActions = (watcher: ActionWatcher) => {
    _actionWatcher = watcher;
}

export const getActionWatcher = () => _actionWatcher;


interface WatchStoreOptions extends Omit<CoreWatchOptions, 'scheduler'> {

}

interface EffectStoreOptions extends Omit<CoreEffectOptions, 'scheduler' | 'lazy'> {
    flush?: 'sync' | 'post';
}

export const watchStore = <T extends (state: any) => any>(fn: T, clb: WatchCallback<T>, options?: WatchStoreOptions): Disposer => {
    return watch((() => fn(getGlobalStore())) as any, clb, options);
}

export const effectStore = <T extends (s: any) => any>(fn: T, options?: EffectStoreOptions): Disposer => {
    const scheduler: Scheduler | undefined = options?.flush === 'sync' ? undefined : tickScheduler();
    return coreEffect(() => fn(getGlobalStore), {
        ...options,
        scheduler,
    }).dispose;
}