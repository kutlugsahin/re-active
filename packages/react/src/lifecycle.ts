import { useContext as reactUseContext, useRef as reactUseRef, useImperativeHandle as reactUseImperativeHandle, RefObject, MutableRefObject} from 'react';

type Callback = () => void;

export interface LifeCycle {
    onMounted: Callback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
    context: React.Context<any>[];
    selfRef: any;
    imperativeHandler: any;
}


let currentLifecycleHandle: LifeCycle | null = null;
let _isInSetupPhase = false;

export const beginRegisterLifecyces = (selfRef: any) => {
    _isInSetupPhase = true;
    currentLifecycleHandle = {
        onMounted: [],
        onUnmounted: [],
        onUpdated: [],
        context: [],
        selfRef,
        imperativeHandler: null,
    }
}

export const endRegisterLifecycles = () => {
    _isInSetupPhase = false;
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

export function ref<T>() {
    let _value: T;
    return {
        get current() { return _value; },
        set current(value: T) { value = value}
    }
}

export function imperativeHandle<T>(handler: T) {
    if (!currentLifecycleHandle?.selfRef) {
        return;
    }

    currentLifecycleHandle!.imperativeHandler = () => handler;
    return reactUseImperativeHandle(currentLifecycleHandle?.selfRef, currentLifecycleHandle!.imperativeHandler);
}

export const isInSetupPhase = () => _isInSetupPhase;