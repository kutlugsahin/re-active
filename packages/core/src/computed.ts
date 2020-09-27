import { computed as vendorComputed, stop, WritableComputedRef } from "@vue/reactivity";
import { Box } from './reactive';

export type WatchCallback<T> = (newValue: T, oldValue?: T) => void;

export interface Computed<T> extends Box<T> {
    watch: (clb: WatchCallback<T>) => void;
    dispose: () => void;
}

export interface ReadonlyComputed<T> extends Computed<T> {
    readonly value: T;
}

export interface ComputedGetterSetter<T> {
    get: () => T;
    set: (val: T) => void;
}

export function computed<T>(getterSetter: ComputedGetterSetter<T>): Computed<T>;
export function computed<T>(fn: () => T): ReadonlyComputed<T>;
export function computed<T>(fnOrGetterSetter: any): any {
    let computed: any = {};

    let computedRef = vendorComputed<T>(fnOrGetterSetter) as WritableComputedRef<T>;

    const rest = Reflect.ownKeys(computedRef).reduce((acc: any, key) => {
        if (key !== 'value' && key !== 'effect') {
            acc[key] = Reflect.get(computedRef, key);
        }
        return acc;
    }, {});

    Object.assign(computed, {
        ...rest,
        dispose: () => {
            if (computedRef) {
                stop(computedRef.effect);
                computedRef = null!;
            }
        },
    });

    const valueAttributes = typeof fnOrGetterSetter === 'function' ?
        {
            get() { return computedRef.value },
            configurable: true,
        } : {
            get() { return computedRef.value },
            set(val: T) { computedRef.value = val; },
            configurable: true
        }

    Reflect.defineProperty(computed, 'value', valueAttributes)

    return computed;
}