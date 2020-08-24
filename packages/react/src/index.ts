export { createComponent, config } from './component';
export { computed, watch } from './shared';
export { onMounted, onUnmounted, onUpdated, useContext, imperativeHandle } from './lifecycle';
export { effect, isReactive, readonly, toBox, toBoxes, reactive, isBox } from '@re-active/core';

export type { Calculated, Computed, Effect, EffectOptions, Reactive, Box, ShallowReactive, Scheduler, UnBox } from '@re-active/core';
export type { ReactiveComponent, Renderer, ReactiveComponentWithHandle } from './component';
export type { WatchOptions, Flush } from './shared';