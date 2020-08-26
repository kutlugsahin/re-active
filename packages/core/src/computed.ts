import { computed as vendorComputed, stop } from "@vue/reactivity";
import { Box } from './reactive';
import { watch } from './watch';

export interface Computed<T> extends Box<T> {
    value: T,
    watch: (listener: (olVal: T, newVal: T) => void) => () => void
    isActive: boolean
    dispose: () => void;
}

type Compute<F extends () => any> = Computed<ReturnType<F>>;

export const computed = <T extends () => any>(fn: T): Compute<T> => {
    const cmp = vendorComputed(fn);

    const { effect, value, ...rest } = cmp;

    return {
        ...rest,
        get value() {
            return cmp.value;
        },
        watch: (clb) => watch<() => any>(() => cmp.value, clb),
        get isActive() {
            return cmp.effect.active
        },
        dispose: () => stop(cmp.effect)
    }
}