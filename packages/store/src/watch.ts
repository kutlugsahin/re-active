import { Callback, coreEffect, CoreEffectOptions, CoreWatchOptions, Disposer, Scheduler, tickScheduler, watch, WatchCallback, WatchSource } from '@re-active/core';
import { getGlobalStore, State, addResetListener } from './createStore';

const effectSet = new Set<Callback>();

addResetListener(() => {
    for (const invalidate of effectSet) {
        invalidate();        
    }
})

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


const withInvalidation = (getDisposer: () => Disposer): Disposer => {
    let disposer = getDisposer();

    function invalidate() {
        disposer();
        disposer = getDisposer();
    }

    effectSet.add(invalidate);

    return () => {
        effectSet.delete(invalidate);
        disposer();
    }
}

export function watchStore<T>(getter: (state: State) => T, callback: WatchCallback<T>, options?: WatchStoreOptions): Disposer {
    const createWatcher = () => watch(() => getter(getGlobalStore()), callback, options);

    return withInvalidation(createWatcher);
}

export const effectStore = (fn: (state: State) => any, options?: EffectStoreOptions): Disposer => {
    const scheduler: Scheduler | undefined = options?.flush === 'sync' ? undefined : tickScheduler();
    const createEffect = () => coreEffect(() => fn(getGlobalStore), {
        ...options,
        scheduler,
    }).dispose;

    return withInvalidation(createEffect);
}
