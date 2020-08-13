import { useContext as reactUseContext, useRef as reactUseRef, useImperativeHandle as reactUseImperativeHandle, RefObject, MutableRefObject, Ref} from 'react';

type Callback = () => void;

export interface LifeCycle {
    onMounted: Callback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
    context: React.Context<any>[];
    imperativeHandler: any;
}


let currentLifecycleHandle: LifeCycle | null = null;
let _isInSetupPhase = false;

export const beginRegisterLifecyces = () => {
    _isInSetupPhase = true;
    currentLifecycleHandle = {
        onMounted: [],
        onUnmounted: [],
        onUpdated: [],
        context: [],
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

export function imperativeHandle<H, T>(ref: Ref<H>, handler: T) {
    currentLifecycleHandle!.imperativeHandler = () => handler;
    return reactUseImperativeHandle(ref, currentLifecycleHandle!.imperativeHandler);
}

export const isInSetupPhase = () => _isInSetupPhase;