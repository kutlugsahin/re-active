import { Callback, coreEffect, CoreEffectOptions, CoreWatchOptions, Disposer, Scheduler, tickScheduler, watch, WatchCallback, WatchSource } from '@re-active/core';
import { getGlobalStore, State, addResetListener, isReactivityDisabled, getStateType, StateType } from './createStore';

const disposerSet = new Set<Callback>();
const stateUpdateListenerSet = new Set<Callback>();

addResetListener({
    destroy() {
        for (const dispose of disposerSet) {
            dispose();
        }
    },
    onStateUpdate() {
        for (const update of stateUpdateListenerSet) {
            update();
        }
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

function waitForStateInit(createEffect: () => Disposer): Disposer {
    let disposer: Disposer | undefined;

    function onStateUpdate() {
        if (!disposer) {
            disposer = createEffect();
        }
    }

    function dispose() {
        stateUpdateListenerSet.delete(onStateUpdate);
        disposer?.();
    }

    stateUpdateListenerSet.add(onStateUpdate);

    if (getStateType() !== StateType.none) {
        disposer = createEffect();
    }

    disposerSet.add(dispose);

    return dispose;
}

export function watchStore<T>(getter: (state: State) => T, callback: WatchCallback<T>, options?: WatchStoreOptions): Disposer {
    return waitForStateInit(() => {
        if (isReactivityDisabled()) {
            const getterValue = getter(getGlobalStore());
            if (options?.immediate) {
                callback(getterValue, undefined!);
            }
            return () => { };
        } else {
            return watch(() => getter(getGlobalStore()), callback, options);
        }
    })
}

export const effectStore = (fn: (state: State) => any, options?: EffectStoreOptions): Disposer => {
    return waitForStateInit(() => {
        if (isReactivityDisabled()) {
            fn(getGlobalStore());
            return () => { };
        } else {
            const scheduler: Scheduler | undefined = options?.flush === 'sync' ? undefined : tickScheduler();
            return coreEffect(() => fn(getGlobalStore()), {
                ...options,
                scheduler,
            }).dispose;
        }
    })
}
