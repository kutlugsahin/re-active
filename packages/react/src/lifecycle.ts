import { useContext as reactUseContext, useRef as reactUseRef, useImperativeHandle as reactUseImperativeHandle, RefObject, MutableRefObject} from 'react';

type Callback = () => void;

export interface LifeCycle {
    onMounted: Callback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
    context: React.Context<any>[];
    refs: null[];
    selfRef: any;
    imperativeHandler: any;
}


let currentLifecycleHandle: LifeCycle | null = null;
let _isInSetupPhase = false;

export const beginRegisterLifecyces = (selfRef: any) => {
    currentLifecycleHandle = {
        onMounted: [],
        onUnmounted: [],
        onUpdated: [],
        context: [],
        refs: [],
        selfRef,
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

export function ref<T>(initialVal?: T | null) {
    currentLifecycleHandle?.refs.push(null);
    return reactUseRef<T>(initialVal || null);
}

export function imperativeHandle<T>(handler: T) {
    if (!currentLifecycleHandle?.selfRef) {
        console.error('Trying to use define imperative handle in a component without handle. Use createComponent.withHandle to define your component');
        return;
    }

    currentLifecycleHandle!.imperativeHandler = () => handler;
    return reactUseImperativeHandle(currentLifecycleHandle?.selfRef, currentLifecycleHandle!.imperativeHandler);
}

export const isInSetupPhase = () => _isInSetupPhase;