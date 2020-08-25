import { computed as vendorComputed, stop } from "@vue/reactivity";
import { watch } from './watch';

export type Computed<T> = {
    value: T,
    watch: (listener: (olVal: T, newVal: T) => void) => () => void
    isActive: boolean
    dispose: () => void;
}

type Compute<F extends () => any> = Computed<ReturnType<F>>;

export const computed = <T extends () => any>(fn: T): Compute<T> => {
    const cmp = vendorComputed(fn);

    return {
        get value() {
            return cmp.value;
        },
        watch: (clb) => watch(() => cmp.value, clb),
        get isActive() {
            return cmp.effect.active
        },
        dispose: () => stop(cmp.effect)
    }
}