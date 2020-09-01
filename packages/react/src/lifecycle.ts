import { useContext as reactUseContext, useRef as reactUseRef, useImperativeHandle as reactUseImperativeHandle, RefObject, MutableRefObject, Ref} from 'react';

export type Callback = () => void;

export interface LifeCycle {
    onMounted: Callback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
    onRendered: Callback[];
    context: React.Context<any>[];
    imperativeHandler: any;
}

export interface ComponentHandle {
    willRender: boolean;
    onUpdated: (clb: Callback) => () => void;
    notify: () => void;
}

function getCurrentLifeCycleHandle() {
    if (currentLifecycleHandle) {
        return currentLifecycleHandle;   
    }

    console.warn("Reactive Hooks must be declared in component scope");
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
        onRendered: [],
        context: [],
        imperativeHandler: null,
    }
}

export const endRegisterLifecycles = () => {
    const lifecycles = currentLifecycleHandle;
    currentLifecycleHandle = null;
    return lifecycles!;
}

export function onMounted(callback: () => void) {
    getCurrentLifeCycleHandle()?.onMounted.push(callback);
}

export function onUnmounted(callback: () => void) {
    getCurrentLifeCycleHandle()?.onUnmounted.push(callback);
}

export function onUpdated(callback: () => void) {
    getCurrentLifeCycleHandle()?.onUpdated.push(callback);
}

export function onRendered(callback: () => void) {
    getCurrentLifeCycleHandle()?.onRendered.push(callback);
}

export function useContext<T>(context: React.Context<T>) {
    getCurrentLifeCycleHandle()?.context.push(context);
    return reactUseContext(context);
}

export function imperativeHandle<H, T>(ref: Ref<H>, handler: T) {
    const lifecyclehandle = getCurrentLifeCycleHandle();
    if (lifecyclehandle) {
        lifecyclehandle.imperativeHandler = () => handler;
        return reactUseImperativeHandle(ref, currentLifecycleHandle!.imperativeHandler);
    }
}

export const getComponentHandle = () => {
    return currentComponentHandle;
}