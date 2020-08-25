import { coreEffect, Scheduler } from './effect';
import { tickScheduler } from './utils';

export interface WatchOptions {
    immediate?: boolean;
    flush?: 'sync' | 'post',
    scheduler?: Scheduler;
}

export const watch = <T extends () => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
    let oldValue: ReturnType<T>;
    let shouldRun = false;
    const scheduler: Scheduler = options?.scheduler || (options?.flush === 'sync' ? p => p() : tickScheduler());

    return coreEffect(() => {
        const newValue = fn();
        if (options?.immediate) {
            shouldRun = true;
        }

        if (shouldRun) {
            clb(newValue, oldValue);
            oldValue = newValue;
        } else {
            shouldRun = true;
        }
    }, {
        scheduler,
    }).dispose;
}