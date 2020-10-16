import { box, Box, Computed, coreEffect, Effect, queueMicroTask } from '@re-active/core';
import { ReactElement } from 'react';
import { computed } from './reactivity';
import { ComponentType } from './schedulers';

type Renderer = () => ReactElement | null;
type Updater = () => void;

export const createComputedRenderer = (renderer: Renderer, updater: Updater, type: ComponentType) => {
    let willUpdate = false;
    let invalidateRef: Box<any>;
    let _job: (() => any) | null;

    let computedRender: Computed<ReactElement<any> | null>;

    let renderEffect: Effect;

    function initRenderEffect() {
        if (type === ComponentType.observer) {
            invalidateRef = box({});
            computedRender = computed(() => {
                invalidateRef.value;
                return renderer();
            });
        } else {
            computedRender = computed(renderer);
        }

        renderEffect = coreEffect(() => computedRender.value, {
            scheduler(job) {
                _job = job;
                if (!willUpdate) {
                    willUpdate = true;
                    queueMicroTask(updater);
                }
            }
        });

        return computedRender.value;
    }

    return {
        render() {
            if (!computedRender) {
                return initRenderEffect();
            }

            if (!willUpdate) {
                willUpdate = true;
                invalidateRef.value = {};
            }

            _job?.();
            willUpdate = false;
            return computedRender.value;
        },
        dispose() {
            computedRender.dispose();
            renderEffect.dispose();
        },
        willUpdate() {
            willUpdate = true;
        }
    };
}