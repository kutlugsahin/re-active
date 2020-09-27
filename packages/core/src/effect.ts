import { DebuggerEvent, effect as vendorEffect, ReactiveEffectOptions, stop } from "@vue/reactivity";

export type Scheduler = (run: () => void) => any;

export type Disposer = () => void;

export type Effect = {
    isActive: boolean;
    dispose: Disposer;
}

export type ReactivityEvent = DebuggerEvent;

export interface CoreEffectOptions extends ReactiveEffectOptions {
    scheduler?: Scheduler;
    onTrack?: (event: ReactivityEvent) => void;
    onTrigger?: (event: ReactivityEvent) => void;
}

export const coreEffect = (fn: () => any, options?: CoreEffectOptions): Effect => {
    let eff = vendorEffect(fn, options);

    return {
        get isActive() {
            return eff.active;
        },
        dispose: () => {
            stop(eff);
            eff = null!;
        },
    }
}