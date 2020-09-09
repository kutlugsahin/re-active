export { createComponent, config } from './component';
export { observer, ObserverComponent } from './observer';
export type { ObserverFunctionalComponent } from './observer';
export * from './observerHooks';
export { computed, watch, effect } from './shared';
export { onMounted, onUnmounted, onUpdated, useContext, onRendered, onBeforePaint, onBeforeRender, imperativeHandle } from './lifecycle';
export { isReactive, readonly, toBox, toBoxes, reactive, isBox } from '@re-active/core';

export type { Computed, Reactive, Box, ShallowReactive, Scheduler, UnBox } from '@re-active/core';
export type { ReactiveComponent, Renderer, ReactiveComponentWithHandle } from './component';
export type { WatchOptions, Flush, EffectOptions } from './shared';