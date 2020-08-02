export { createComponent } from './component';
export { computed, reactive, watch, createTickScheduler } from './shared';
export { onMounted, onUnmounted, onUpdated } from './lifecycle';
export { effect, isReactive } from '@re-active/core';

export type { Calculated, Computed, Effect, EffectOptions, WatchOptions } from '@re-active/core';
export type { ReactiveComponent, Renderer } from './component';
