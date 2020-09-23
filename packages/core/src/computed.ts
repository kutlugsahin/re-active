import { computed as vendorComputed, stop, WritableComputedRef } from "@vue/reactivity";
import { Box } from './reactive';
import { watch } from './watch';

export type WatchCallback<T> = (newValue: T, oldValue?: T) => void;

export interface Computed<T> extends Box<T> {
    watch: (clb: WatchCallback<T>) => void;
    dispose: () => void;
    invalidate: () => void;
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
    const computed: any = {};

    function invalidate() {
        computed.dispose?.();
        populateComputed(vendorComputed(fnOrGetterSetter));
    }

    function populateComputed(computedRef: WritableComputedRef<T>) {

        const rest = Reflect.ownKeys(computedRef).reduce((acc: any, key) => {
            if (key !== 'value' && key !== 'effect') {
                acc[key] = Reflect.get(computedRef, key);
            }
            return acc;
         }, {});

        Object.assign(computed, {
            ...rest,
            watch: (clb: WatchCallback<T>) => watch(computedRef, clb),
            dispose: () => stop(computedRef.effect),
            invalidate,
        });

        const valueAttributes = typeof fnOrGetterSetter === 'function' ?
            {
                get() { return computedRef.value },
            } : {
                get() { return computedRef.value },
                set(val: T) { computedRef.value = val; }
            }

        Reflect.defineProperty(computed, 'value', valueAttributes)
    }

    populateComputed(vendorComputed(fnOrGetterSetter));

    return computed;
}