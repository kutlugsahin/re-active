import { Computed } from './computed';
import { coreEffect, Disposer, ReactivityEvent, Scheduler } from './effect';
import { Box, isBox, isReactive } from './reactive';
import { tickScheduler, traverse } from './utils';

export interface CoreWatchOptions {
    immediate?: boolean;
    flush?: 'sync' | 'post',
    scheduler?: Scheduler;
    onTrack?: (event: ReactivityEvent) => void;
    onTrigger?: (event: ReactivityEvent) => void;
    onStop?: () => void;
    deep?: boolean;
}

function traverseAndReturn(source: any) {
    traverse(source, new Set());
    return source;
}

export type WatchSource = (() => any) | Box<any> | Computed<any> | object;

export type WatchCallback<T> = (newValue: T, oldValue: T) => void;

export function watch<T>(source: Box<T>, clb: WatchCallback<T>, options?: CoreWatchOptions): Disposer;
export function watch<T>(source: () => T, clb: WatchCallback<T>, options?: CoreWatchOptions): Disposer;
export function watch<T>(source: Computed<T>, clb: WatchCallback<T>, options?: CoreWatchOptions): Disposer;
export function watch<T extends object>(source: T, clb: WatchCallback<T>, options?: CoreWatchOptions): Disposer;
export function watch<T extends WatchSource>(source: T, clb: WatchCallback<any>, options?: CoreWatchOptions): Disposer {
    let oldValue: any;
    let shouldRun = options?.immediate || false;
    const scheduler: Scheduler | undefined = options?.scheduler || (options?.flush === 'sync' ? undefined : tickScheduler());

    let effectBody: () => any;

    if (typeof source === 'function') {
        effectBody = source as () => any;
    } else if (isBox(source)) {
        if (options?.deep) {
            effectBody = () => traverseAndReturn(source);
        } else {
            effectBody = () => (source as unknown as Box<any>).value;
        }
    } else if (isReactive(source)) {
        if (options?.deep) {
            effectBody = () => traverseAndReturn(source);
        } else {
            // watching first level fields
            effectBody = () => ({ ...source });
        }
    }

    return coreEffect(() => {
        const newValue = effectBody();

        if (shouldRun) {
            clb(newValue, oldValue);
            oldValue = newValue;
        } else {
            shouldRun = true;
        }
    }, {
        scheduler,
        onTrack: options?.onTrack,
        onTrigger: options?.onTrigger,
        onStop: options?.onStop
    }).dispose;
}