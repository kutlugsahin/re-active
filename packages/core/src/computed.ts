import { computed as vendorComputed, stop, WritableComputedRef } from "@vue/reactivity";
import { Box } from './reactive';
import { watch } from './watch';

type WatcherCallback<T> = (olVal: T, newVal: T) => void;

export interface Computed<T> extends Box<T> {
    watch: (clb: WatcherCallback<T>) => void;
    isActive: boolean;
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
    const cmp = vendorComputed(fnOrGetterSetter) as WritableComputedRef<T>;

    const { effect, ...rest } = cmp;

    const computed = {
        ...rest,
        watch: (clb: WatcherCallback<T>) => watch(cmp, clb),
        get isActive() {
            return cmp.effect.active
        },
        dispose: () => stop(cmp.effect)
    }

    const valueAttributes = typeof fnOrGetterSetter === 'function' ?
        {
            get() { return cmp.value },
        } : {
            get() { return cmp.value },
            set(val: T) { cmp.value = val; }
        }

    Reflect.defineProperty(computed, 'value', valueAttributes)

    return computed;
}