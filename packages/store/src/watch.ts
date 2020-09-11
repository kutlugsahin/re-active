import { coreEffect, CoreEffectOptions, CoreWatchOptions, Disposer, Scheduler, tickScheduler, watch, WatchCallback, WatchSource } from '@re-active/core';
import { getGlobalStore, State } from './createStore';

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


export function watchStore<T>(getter: (state: State) => T, callback: WatchCallback<T>, options?: WatchStoreOptions): Disposer {
    return watch(() => getter(getGlobalStore()), callback, options);
}

export const effectStore = (fn: (state: State) => any, options?: EffectStoreOptions): Disposer => {
    const scheduler: Scheduler | undefined = options?.flush === 'sync' ? undefined : tickScheduler();
    return coreEffect(() => fn(getGlobalStore), {
        ...options,
        scheduler,
    }).dispose;
}