import { Computed, computed } from '@re-active/core';
import { getGlobalStore } from './createStore';

export type Selector<S = any> = (s: S) => any;
export const selector = <T extends Selector>(fn: T): Computed<ReturnType<T>> => {
    return computed(() => fn(getGlobalStore()));
}

type ComputedSelectorMap<S, T extends Selectors<S>> = {
    [key in keyof T]: ReturnType<T[key]>
}

type Selectors<S> = { [key: string]: Selector<S> };


export const createSelectors = <S, T extends Selectors<S>>(selectors: T): ComputedSelectorMap<S, T> => {

    const result = {};

    for (const key in selectors) {
        if (Object.prototype.hasOwnProperty.call(selectors, key)) {
            const selectorResult = selector(selectors[key]);

            Object.defineProperty(result, key, {
                get() {
                    return selectorResult.value;
                },
            });
        }
    }

    return result as ComputedSelectorMap<S, T>;
}