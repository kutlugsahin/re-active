import { Scheduler, queueMicroTask, tickScheduler } from '@re-active/core';
import { Callback } from './lifecycle';

export enum ComponentType {
    reactive,
    observer
};

export interface ComponentSchedulerHandle {
    componentType: ComponentType;
    willRender: boolean;
    onComponentUpdated: (clb: Callback) => Callback;
    componentUpdated: Callback;
}

let currentComponentSchedulerHandle: ComponentSchedulerHandle | null = null;

export const setCurrentComponentSchedulerHandle = (handle: ComponentSchedulerHandle | null) => {
    return currentComponentSchedulerHandle = handle;
}

export const getComponentSchedulerHandle = () => {
    return currentComponentSchedulerHandle;
}

export const createComponentEffectSchedulerHandle = (componentType: ComponentType): ComponentSchedulerHandle => {
    let listeners = new Set<Callback>();

    function onUpdated(clb: Callback) {
        listeners.add(clb);

        return () => {
            listeners.delete(clb);
        }
    }

    return {
        componentType,
        willRender: true,
        onComponentUpdated: onUpdated,
        componentUpdated() {
            for (const clb of listeners) {
                clb();
            }
            listeners.clear();
        }
    }
}

// combine shedulers so that they run one after another (not concurrent)
export function combineSchedulers(schedulers: Scheduler[]): Scheduler {

    function combine(clb: Callback, schedulerArr: Scheduler[]) {
        const [current, ...rest] = schedulerArr;

        if (current) {
            current(() => {
                combine(clb, rest);
            })
        } else {
            clb();
        }
    }

    return (clb: Callback) => combine(clb, schedulers);
}

export const onUpdatedScheduler = (): Scheduler => {
    const componentHandle = getComponentSchedulerHandle();
    let isRunning = false;
    let _job: Callback | null = null;
    let unsubscribe: Callback | undefined;

    function notify() {
        isRunning = false;
        _job?.();
        _job = null;
        unsubscribe?.();
    }

    return (job) => {
        _job = job;
        if (componentHandle) {
            if (!isRunning) {
                isRunning = true;
                queueMicroTask(() => {
                    if (componentHandle.willRender) {
                        unsubscribe = componentHandle.onComponentUpdated(notify);
                    } else {
                        notify();
                    }
                })
            }
        } else {
            job();
        }
    }
}

export type Flush = 'pre' | 'post' | 'sync';

export function createFlushScheduler(flush: Flush): Scheduler {
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