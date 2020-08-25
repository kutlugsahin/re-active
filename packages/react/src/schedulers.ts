import { Scheduler, queueMicroTask } from '@re-active/core';
import { Callback, getComponentHandle, onMounted } from './lifecycle';

// combine shedulers so that they run one after another (not concurrent)
export function combineSchedulers(schedulers: Scheduler[]): Scheduler {
    
    function combine(clb: Callback, schedulerArr: Scheduler[]) {
        const [current, ...rest] = schedulerArr;

        if (current) {
            current(() => {
                combine(clb, rest);
            })
        } else {
            clb();
        }
    }

    return (clb: Callback) => combine(clb, schedulers);
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
    let _job: Callback | null = null;
    let unsubscribe: Callback | undefined;

    function notify() {
        isRunning = false;
        _job?.();
        _job = null;
        unsubscribe?.();
    }

    return (job) => {
        _job = job;
        if (componentHandle) {
            if (!isRunning) {
                isRunning = true;
                queueMicroTask(() => {
                    if (componentHandle.willRender) {
                        unsubscribe = componentHandle.onUpdated(notify);
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