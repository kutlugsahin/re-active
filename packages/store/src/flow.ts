import { OmitStateParameter, CancelablePromise, GeneratorReturn, GeneratorAction, Callback, AbortPromise } from './types';
import { getGlobalStore } from './createStore';
import { Signal } from './types';
import { action } from '.';

function abortPromise<T>(abortResult?: T): AbortPromise<T> {
    let resolve: () => void;
    const promise = () => new Promise<T>((res) => {
        resolve = res;
    });

    function abort() {
        resolve();
    }

    return {
        promise,
        abort
    }
}

export const signal = <T>() => {
    const listeners: Set<Callback<T>> = new Set();

    const listen = (clb: Callback<T>) => {
        listeners.add(clb);

        return () => {
            listeners.delete(clb);
        }
    }

    const sendSignal = (param: T) => {
        for (const listener of listeners) {
            listener(param);
        }
    }

    sendSignal.listen = listen;

    return sendSignal;
}

export const isCancelled = () => void 0; 

export function generatorFlow<T extends (...p: any[]) => Generator>(fn: T) {

    return (...params: OmitStateParameter<T>): CancelablePromise<GeneratorReturn<T>> => {
        const iterator = fn(getGlobalStore() as any, ...params);
        let currentIteration: IteratorResult<any, any> = { done: false, value: null };
        let abortControl: AbortPromise | undefined = abortPromise();

        function cancel() {
            // signal abour promise to break race condition
            abortControl?.abort();

            // if current yielded promise is cancelable cancel
            if (currentIteration.value?.cancel) {
                currentIteration.value?.cancel();
            }

            // return generator
            iterator.return(undefined);

            // clear abortControl
            abortControl = undefined;
        }

        async function run() {
            while (!currentIteration.done) {
                if (abortControl) {
                    // is not aborted, iterate yields with abort control
                    currentIteration = iterator.next(currentIteration.value);
                    currentIteration.value = await Promise.race([Promise.resolve(currentIteration.value), abortControl!.promise()]);
                } else {
                    // generator aborted generator goes to finally block
                    // pass to for yield check
                    currentIteration = iterator.next(true)
                }
            }
        }

        const result = run() as CancelablePromise<GeneratorReturn<T>>;
        result.cancel = cancel;
        return result;
    }
}

export function take<T>(signal: Signal<T>) {
    return new Promise<T>(res => {
        const dispose = signal.listen((param) => {
            res(param);
            dispose();
        });
    })
}

export const race = (promises: Promise<any>[]) => {
    const resolved = Promise.race(promises);

    const nonResolved = promises.filter(p => p !== resolved) as CancelablePromise<any>[];

    for (const cancelable of nonResolved) {
        if (cancelable.cancel) {
            cancelable.cancel();
        }
    }

    return resolved;
}

export const all = (promises: Promise<any>[]) => {
    return Promise.all(promises);
}

export const takeLatest = <T extends GeneratorAction>(fn: T): ((...p: Parameters<T>) => Promise<GeneratorReturn<T>>) => {
    let promise: CancelablePromise<GeneratorReturn<T>>;
    let callable = action(fn);

    return async function (...p: Parameters<T>) {
        if (promise && promise.cancel) {
            promise.cancel();
        }

        promise = callable(...p.slice(1));

        return promise;
    }
}