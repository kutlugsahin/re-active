import { callable } from './action';
import { GeneratorAction, GeneratorReturn, Action, Callback, CancelablePromise, Signal } from './types';

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
    let callableAction = callable(fn);

    return async function (...p: Parameters<T>) {
        if (promise && promise.cancel) {
            promise.cancel();
        }

        promise = callableAction(...p);

        return promise;
    }
}

export const debounce = <T extends Action>(fn: T) => {
    let timer: NodeJS.Timeout | null;
    let callableAction = callable(fn);
    let resolver: any;
    let promise: CancelablePromise<any>;

    function cancel() {
        if (timer) clearTimeout(timer);
        if (resolver) resolver();
    }

    return function (...p: Parameters<T>) {
        cancel();

        promise = new Promise(res => {
            resolver = res;
        }) as CancelablePromise<any>;

        promise.cancel = cancel;

        timer = setTimeout(() => {
            Promise.resolve(callableAction(...p)).then(resolver);
            resolver = null;
            timer = null;
        }, 100);

        return promise;
    }
}