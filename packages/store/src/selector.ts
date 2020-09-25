import { Computed, computed, ReadonlyComputed } from '@re-active/core';
import { getGlobalStore, addResetListener, isReactivityDisabled, getStateType, StateType } from './createStore';

const selectorComputedMap = new Set<Computed<any>>();

addResetListener({
    destroy() {
        for (const computedValues of selectorComputedMap) {
            computedValues.dispose();
        }
    }
})

export type Selector<S = any> = (s: S) => any;

const computedSelector = <T extends Selector>(fn: T): ReadonlyComputed<ReturnType<T>> => {
    if (isReactivityDisabled()) {
        return {
            '__v_isRef': true,
            get value() {
                return fn(getGlobalStore());
            },
            dispose() { },
        } as unknown as ReadonlyComputed<ReturnType<T>>;
    } else {
        return computed(() => fn(getGlobalStore()));
    }
}

export const selector = <T extends Selector>(fn: T): ReadonlyComputed<ReturnType<T>> => {
    let computedValue = computedSelector(fn);

    const selectorResult: ReadonlyComputed<ReturnType<T>> = {
        '__v_isRef': true,
        get value() {
            return computedValue.value;
        },
        dispose() {
            computedValue?.dispose();
            computedValue = computedSelector(fn);
        },
    } as unknown as ReadonlyComputed<ReturnType<T>>;

    selectorComputedMap.add(selectorResult);

    return selectorResult;
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