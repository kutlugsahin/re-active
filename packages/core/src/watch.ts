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

export type WatchCallback<T extends WatchSource> =
    T extends () => infer R ? (newValue: R, oldValue: R) => void :
    T extends (...p : any[]) => infer R ? (newValue: R, oldValue: R) => void :
    T extends Box<infer R> ? (newValue: R, oldValue: R) => void :
    T extends object ? (newValue: T, oldValue: T) => void : never;

export function watch<T extends WatchSource>(source: T, clb: WatchCallback<T>, options?: CoreWatchOptions): Disposer {
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
        effectBody = () => traverseAndReturn(source);
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