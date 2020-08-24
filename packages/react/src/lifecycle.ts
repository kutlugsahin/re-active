import { useContext as reactUseContext, useRef as reactUseRef, useImperativeHandle as reactUseImperativeHandle, RefObject, MutableRefObject, Ref} from 'react';

export type Callback = () => void;

export interface LifeCycle {
    onMounted: Callback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
    context: React.Context<any>[];
    imperativeHandler: any;
}

export interface ComponentHandle {
    willRender: boolean;
    onUpdated: (clb: Callback) => void;
    notify: () => void;
}


let currentLifecycleHandle: LifeCycle | null = null;
let currentComponentHandle: ComponentHandle | null = null;

export const setCurrentComponentHandle = (handle: ComponentHandle | null) => {
    return currentComponentHandle = handle;
}

export const beginRegisterLifecyces = () => {
    currentLifecycleHandle = {
        onMounted: [],
        onUnmounted: [],
        onUpdated: [],
        context: [],
        imperativeHandler: null,
    }
}

export const endRegisterLifecycles = () => {
    return currentLifecycleHandle!;
}

export function onMounted(callback: () => void) {
    currentLifecycleHandle!.onMounted.push(callback);
}

export function onUnmounted(callback: () => void) {
    currentLifecycleHandle!.onUnmounted.push(callback);
}

export function onUpdated(callback: () => void) {
    currentLifecycleHandle!.onUpdated.push(callback);
}

export function useContext<T>(context: React.Context<T>) {
    currentLifecycleHandle?.context.push(context);
    return reactUseContext(context);
}

export function imperativeHandle<H, T>(ref: Ref<H>, handler: T) {
    currentLifecycleHandle!.imperativeHandler = () => handler;
    return reactUseImperativeHandle(ref, currentLifecycleHandle!.imperativeHandler);
}

export const getComponentHandle = () => {
    return currentComponentHandle;
}