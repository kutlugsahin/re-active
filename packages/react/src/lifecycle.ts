type Callback = () => void;

interface LifeCycle {
    onMounted: Callback[];
    onUnmounted: Callback[];
    onUpdated: Callback[];
}


let currentLifecycleHandle: LifeCycle | null = null;
let _isInSetupPhase = false;

export const beginRegisterLifecyces = () => {
    currentLifecycleHandle = {
        onMounted: [],
        onUnmounted: [],
        onUpdated: [],
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

export const isInSetupPhase = () => _isInSetupPhase;