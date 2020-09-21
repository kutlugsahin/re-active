import { Computed, computed } from '@re-active/core';
import { Selector, Store, SelectorMap, Selectors } from './types';

export const selector = <T extends Selector, TStore extends Store>(fn: T, getStore: () => TStore): Computed<ReturnType<T>> => {
    const result = computed(() => fn(getStore()));
    return result;
}

export function buildSelectors<T extends SelectorMap>(selectorMap: T, getStore: () => Store): Selectors<T> {
    return Object.keys(selectorMap).reduce((acc: any, key) => {
        const entry = selectorMap[key];

        if (typeof entry === 'function') {
            const computedSelector = selector(entry as Selector, getStore);

            Reflect.defineProperty(acc, key, {
                get() {
                    return computedSelector.value;
                }
            })
        } else {
            acc[key] = buildSelectors(entry, getStore);
        }

        return acc;
    }, {} as Selectors<T>)
}