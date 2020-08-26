import { isRef } from '@vue/reactivity';

export const isArray = Array.isArray;
export const isObject = (val: any): val is Record<any, any> => val !== null && typeof val === 'object';

export function traverse(value: any, seen: Set<any> = new Set()) {
    if (!isObject(value) || seen.has(value)) {
        return value
    }
    seen.add(value)
    if (isRef(value)) {
        traverse(value.value, seen)
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen)
        }
    } else if (value instanceof Map) {
        value.forEach((v, key) => {
            // to register mutation dep for existing keys
            traverse(value.get(key), seen)
        })
    } else if (value instanceof Set) {
        value.forEach(v => {
            traverse(v, seen)
        })
    } else {
        for (const key in value) {
            traverse(value[key], seen)
        }
    }
    return value
}

export type Callback = () => void;

export const queueMicroTask = (clb: Callback) => {
    Promise.resolve().then(clb);
}

export const tickScheduler = () => {
    let _job: Callback | null = null;

    let isRunning = false;

    return (job: () => void) => {
        _job = job;
        if (!isRunning) {
            isRunning = true;

            queueMicroTask(() => {
                _job?.();
                _job = null;
                isRunning = false;
            })
        }
    }
}