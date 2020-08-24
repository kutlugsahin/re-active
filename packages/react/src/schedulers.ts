import { Scheduler, queueMicroTask } from '@re-active/core';
import { Callback, getComponentHandle, onMounted } from './lifecycle';

export function combineSchedulers(schedulers: Scheduler[]): Scheduler {
    let _job: () => void;

    let callbacks = schedulers.map(() => false);

    function callSheduler(index: number) {
        schedulers[index](() => {
            callbacks[index] = true;
            checkFire();
        })
    }

    function checkFire() {
        if (callbacks.every(p => p)) {
            _job?.();
            callbacks = schedulers.map(() => false)
        }
    }

    return (job) => {
        _job = job;
        schedulers.forEach((p, index) => callSheduler(index));
    }
}

export const onMountScheduler = () => {
    let shouldRunEffect = false;
    let jobRef: () => void;

    if (getComponentHandle()) {
        onMounted(() => {
            shouldRunEffect = true;
            jobRef?.();
        });
    } else {
        shouldRunEffect = true;
    }

    return (job: () => void) => {
        if (shouldRunEffect) {
            job();
        } else {
            jobRef = job;
        }
    }
}

export const onUpdatedScheduler = (): Scheduler => {
    const componentHandle = getComponentHandle();
    let isRunning = false;
    let _job: Callback;
    
    function notify() {
        isRunning = false;
        _job();
    }

    return (job) => {
        _job = job;
        if (componentHandle) {
            if (!isRunning) {
                isRunning = true;
                queueMicroTask(() => {
                    if (componentHandle.willRender) {
                        componentHandle.onUpdated(() => {
                            notify();
                        })
                    } else {
                        notify();
                    }
                })
            }
        } else {
            job();
        }
    }
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