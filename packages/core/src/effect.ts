import { effect as vendorEffect, ReactiveEffectOptions, stop } from "@vue/reactivity";

export type Scheduler = (run: () => void) => any;

export type Disposer = () => void;

export type Effect = {
    isActive: boolean;
    dispose: Disposer;
}

export interface CoreEffectOptions extends ReactiveEffectOptions {
    scheduler?: Scheduler;
}

export const coreEffect = (fn: () => any, options?: CoreEffectOptions): Effect => {
    let eff = vendorEffect(fn, options);

    return {
        get isActive() {
            return eff.active;
        },
        dispose: () => {
            stop(eff);
        },
    }
}