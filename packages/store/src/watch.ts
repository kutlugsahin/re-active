import { coreEffect, CoreEffectOptions, CoreWatchOptions, Disposer, Scheduler, tickScheduler, watch, WatchCallback } from '@re-active/core';
import { Dictionary } from './types';

export type ActionWatcher = (actionName: string, parameters: any[], result: any) => Promise<void> | void;


interface WatchStoreOptions extends Omit<CoreWatchOptions, 'scheduler'> {

}

interface EffectStoreOptions extends Omit<CoreEffectOptions, 'scheduler' | 'lazy'> {
    flush?: 'sync' | 'post';
}

export type EffectCreator = (store: any) => Disposer;

export function watchStore<T>(getter: (store: any) => T, callback: WatchCallback<T>, options?: WatchStoreOptions): (store: any) => Disposer {
    return (store:any) =>  watch(() => getter(store), callback, options);
}

export const effectStore = (fn: (store: any) => any, options?: EffectStoreOptions): (store:any) => Disposer => {
    const scheduler: Scheduler | undefined = options?.flush === 'sync' ? undefined : tickScheduler();
    return (store: any) => coreEffect(() => fn(store), {
        ...options,
        scheduler,
    }).dispose;
}


export function buildEffects(effects: Dictionary<EffectCreator | Dictionary<any>> | undefined, getStore: () => any) {
    if (effects) {
        return Object.keys(effects).reduce((acc: any, key) => {
            const entry = effects[key];

            if (typeof entry === 'function') {
                acc[key] = entry(getStore());
            } else {
                acc[key] = buildEffects(effects, getStore);
            }

            return acc;
        }, {});
    }

    return undefined;
}