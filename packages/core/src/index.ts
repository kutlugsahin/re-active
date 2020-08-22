import { computed as vendorComputed, effect as vendorEffect, stop, reactive as vendorReactive, UnwrapRef, ref as vendorRef, ComputedRef, isReactive as vendorIsReactive, readonly as vendorReadonly, shallowRef as vendorShallowRef, shallowReactive as vendorShallowReactive, shallowReadonly as vendorShallowReadonly, Ref, toRefs, isRef, ReactiveFlags } from "@vue/reactivity";

const REF_MARKER = '__v_isRef';

type ReactiveObject<T> = T extends Ref ? T : UnwrapRef<T>;

export type Box<T = any> = Ref<T>;
export type UnBox<T> = UnwrapRef<T>;

export type Reactive<T> = T extends object ? ReactiveObject<T> : Box<UnBox<T>>;
export type ShallowReactive<T> = T extends object ? T : T extends Box ? T : Box<T>;

export type Scheduler = (run: () => void) => any;

const ref = <T>(val: T): Box<UnBox<T>> => {
    return vendorRef<T>(val);
}

const shallowRef = <T>(val: T): T extends Box ? T : Box<T> => {
    return vendorShallowRef<T>(val);
}

export const reactive = <T>(val: T): Reactive<T> => {
    const type = typeof val;

    switch (type) {
        case 'bigint':
        case 'number':
        case 'string':
        case 'function':
        case 'boolean': {
            return ref(val) as Reactive<T>
        }
        default:
            return vendorReactive(val as any) as Reactive<T>;
    }
}

reactive.shallow = <T>(val: T): ShallowReactive<T> => {
    const type = typeof val;

    switch (type) {
        case 'bigint':
        case 'number':
        case 'string':
        case 'function':
        case 'boolean': {
            return shallowRef(val) as ShallowReactive<T>
        }
        default:
            return vendorShallowReactive(val as any) as ShallowReactive<T>;
    }
}

reactive.box = <T>(val: T): Box<UnBox<T>> => {
    return ref(val);
}

reactive.shallowBox = <T>(val: T): T extends Box<any> ? T : Box<T> => {
    return vendorShallowRef(val);
}

export const readonly = <T extends Object>(obj: T): T => {
    return vendorReadonly(obj) as T;
}

readonly.shallow = vendorShallowReadonly;

export type Calculated<T> = {
    value: T,
    watch: (listener: (olVal: T, newVal: T) => void) => () => void
    isActive: boolean
    dispose: () => void;
}

export type Computed<F extends () => any> = Calculated<ReturnType<F>>;

export const computed = <T extends () => any>(fn: T): Computed<T> => {
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

function makeReactiveProps(arr: any[]) {
    let state: { [key: number]: any } = {};
    arr.forEach((p, i) => {
        state[i] = p;
    });
    return reactive(state);
}

function updateReactiveProps(props: any[], state: any) {
    props.forEach((p, i) => {
        state[i] = p;
    });
}

export const computedFn = <T extends (...p: any[]) => any>(fn: T): T => {
    let isInited = false;
    let computed: ComputedRef<ReturnType<T>>;
    let reactiveProps: { [key: string]: any };

    return ((...p: Parameters<T>): ReturnType<T> => {
        if (!isInited) {
            reactiveProps = makeReactiveProps(p);
            computed = vendorComputed(() => {
                const params = Object.keys(reactiveProps).map(p => reactiveProps[p]);
                return fn(...params);
            })
        } else {
            updateReactiveProps(p, reactiveProps);
        }

        return computed.value;
    }) as T;
}

export interface WatchOptions {
    scheduler?: Scheduler;
}

export const effect = (fn: () => any, options?: EffectOptions): Effect => {
    const eff = vendorEffect(fn, options);

    return {
        get isActive() {
            return eff.active;
        },
        dispose: () => stop(eff),
    }
}

export const watch = <T extends () => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
    let oldValue: ReturnType<T>;
    let newValue: ReturnType<T>;

    return effect(() => {
        oldValue = newValue;
        newValue = fn();

        if (options?.scheduler) {
            options?.scheduler(() => clb(newValue, oldValue));
        } else {
            clb(newValue, oldValue)
        }
    }, {
        scheduler: options?.scheduler,
    }).dispose;
}

export type Effect = {
    isActive: boolean;
    dispose: () => void;
}

export interface EffectOptions {
    scheduler?: Scheduler;
}

export const isReactive = (value: any) => {
    return vendorIsReactive(value);
}

export const createTickScheduler = () => {

    let jobs = new Set<() => void>();

    let isRunning = false;

    return (job: () => void) => {
        if (!jobs.has(job)) {
            jobs.add(job);
        }

        if (!isRunning) {
            isRunning = true;

            Promise.resolve().then(() => {
                for (const jobtorun of jobs) {
                    jobtorun();
                }

                jobs = new Set();
                isRunning = false;
            })
        }
    }
}

export const createImmediateScheduler = (immediate: boolean = true) => {
    let firstRun = immediate;

    return (job: () => void) => {
        if (firstRun) {
            job();
        } else {
            firstRun = true;
        }
    }
}

export function toBox<T extends Object, K extends keyof T>(obj: T, path: K): Box<T[K]>;
export function toBox<R>(getter: () => R): Box<R>;
export function toBox(objOrGetter: any, path?: string) {
    if (typeof objOrGetter === 'function') {
        return {
            [REF_MARKER]: true,
            get value() {
                return objOrGetter();
            },
            set value(val: any) {
                console.warn('Box defined by getter function is readonly');
            }
        } as any;
    }

    if (typeof path === 'string') {
        return {
            [REF_MARKER]: true,
            get value() {
                return objOrGetter[path!];
            },
            set value(val) {
                objOrGetter[path!] = val;
            }
        }
    }
}

export type ToBoxes<T = any> = {
    [K in keyof T]: Box<T[K]>;
};

export function toBoxes<T extends object>(obj: T): ToBoxes<T> {
    return toRefs(obj)
}

export const isBox = <T>(obj: Box<T> | unknown) => obj && typeof obj === 'object' && REF_MARKER in obj;