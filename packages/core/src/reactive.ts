import { isReactive as vendorIsReactive, reactive as vendorReactive, readonly as vendorReadonly, Ref, ref as vendorRef, shallowReactive as vendorShallowReactive, shallowReadonly as vendorShallowReadonly, shallowRef as vendorShallowRef, toRefs, UnwrapRef, isProxy, isReadonly, toRaw, markRaw, pauseTracking, enableTracking, customRef } from "@vue/reactivity";

export const REF_MARKER = '__v_isRef';

type ReactiveObject<T> = T extends Ref ? T : UnBox<T>;

export type Box<T = any> = Ref<T>;
export type UnBox<T> = UnwrapRef<T>;

export type Reactive<T> =
    T extends null ? Box<any> :
    T extends undefined ? Box <any> :
    T extends Function ? Box<T> :
    T extends object ? ReactiveObject<T> :
    Box<UnBox<T>>;

export type ShallowReactive<T> =
    T extends null ? Box<any> :
    T extends undefined ? Box<any> :
    T extends Function ? Box<T> :
    T extends object ? T :
    T extends Box ? T :
    Box<T>;

export const reactive = <T>(val: T): Reactive<T> => {
    const type = typeof val;

    switch (type) {
        case 'bigint':
        case 'number':
        case 'string':
        case 'function':
        case 'boolean': {
            return vendorRef(val) as Reactive<T>
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
            return vendorShallowRef(val) as ShallowReactive<T>
        }
        default:
            return vendorShallowReactive(val as any) as ShallowReactive<T>;
    }
}

export const box = <T>(val: T): Box<UnBox<T>> => {
    return vendorRef(val);
}

box.shallow = <T>(val: T): Box<T> => {
    return vendorShallowRef(val);
}

export const readonly = <T extends Object>(obj: T): T => {
    return vendorReadonly(obj) as T;
}

readonly.shallow = vendorShallowReadonly;

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

export const isReactive = (value: any) => {
    return vendorIsReactive(value);
}

export const untracked = <T>(fn: () => T) => {
    try {
        pauseTracking();
        return fn();
    } finally {
        enableTracking();
    }
}

type CustomBoxFactory<T> = (track: () => void, trigger: () => void) => {
    get: () => T;
    set: (value: T) => void;
};

export const customBox = <T>(boxCreator: CustomBoxFactory<T>): Box<T> => {
    return customRef(boxCreator);
}

export {
    isProxy,
    isReadonly,
    toRaw,
    markRaw
}