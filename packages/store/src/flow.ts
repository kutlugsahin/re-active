import { AbortPromise, CancelablePromise, GeneratorReturn } from './types';

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

export const isCancelled = () => void 0; 

export function generatorFlow<T extends (...p: any[]) => Generator>(fn: T) {

    return (...params: Parameters<T>): CancelablePromise<GeneratorReturn<T>> => {
        const iterator = fn(...params);
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
            return currentIteration.value;
        }

        const result = run() as CancelablePromise<GeneratorReturn<T>>;
        result.cancel = cancel;
        return result;
    }
}