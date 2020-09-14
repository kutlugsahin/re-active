import { Box, box, Disposer } from '@re-active/core';
import { Ref, useContext as reactUseContext, useImperativeHandle as reactUseImperativeHandle } from 'react';

export type Callback = () => void;
export type MountedCallback = () => (void | Disposer);

export interface LifeCycle {
    onMounted: MountedCallback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
    onRendered: Callback[];
    onBeforeRender: Callback[];
    onBeforePaint: Callback[];
    context: Map<React.Context<any>, Box<any>>;
    imperativeHandler: any;
}

export interface ComponentHandle {
    willRender: boolean;
    onUpdated: (clb: Callback) => Callback;
    notify: Callback;
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
        context: new Map(),
        onBeforePaint: [],
        onBeforeRender: [],
        imperativeHandler: null,
    }
}

export const endRegisterLifecycles = () => {
    const lifecycles = currentLifecycleHandle;
    currentLifecycleHandle = null;
    return lifecycles!;
}

export function onMounted(callback: MountedCallback) {
    getCurrentLifeCycleHandle()?.onMounted.push(callback);
}

export function onUnmounted(callback: Callback) {
    getCurrentLifeCycleHandle()?.onUnmounted.push(callback);
}

export function onUpdated(callback: Callback) {
    getCurrentLifeCycleHandle()?.onUpdated.push(callback);
}

export function onRendered(callback: Callback) {
    getCurrentLifeCycleHandle()?.onRendered.push(callback);
}

export function onBeforeRender(callback: Callback) {
    getCurrentLifeCycleHandle()?.onBeforeRender.push(callback);
}

export function onBeforePaint(callback: Callback) {
    getCurrentLifeCycleHandle()?.onBeforePaint.push(callback);
}

export function useContext<T>(context: React.Context<T>) {
    const contextValue = reactUseContext(context);
    const reactiveValue = box.shallow(contextValue)
    getCurrentLifeCycleHandle()?.context.set(context, reactiveValue);
    return reactiveValue;
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