import { Computed, computed, ReadonlyComputed } from '@re-active/core';
import { getGlobalStore, addResetListener, isReactivityDisabled } from './createStore';

const selectorComputedMap = new Set<Computed<any>>();

addResetListener({
    destroy() {
        for (const computedValues of selectorComputedMap) {
            computedValues.dispose();
        }

        selectorComputedMap.clear();
    }
})

export type Selector<S = any> = (s: S) => any;
export const selector = <T extends Selector>(fn: T): ReadonlyComputed<ReturnType<T>> => {
    if (isReactivityDisabled()) {
        return {
            get value() {
                return fn(getGlobalStore());
            },
        } as Computed<ReturnType<T>>;
    } else {
        const result = computed(() => fn(getGlobalStore()));
        selectorComputedMap.add(result);
        return result;
   }
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