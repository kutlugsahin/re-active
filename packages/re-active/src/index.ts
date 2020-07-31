import { WatchOptions as WatchOptionsType } from './shared';
export { createComponent } from './component';
export { computed, reactive, watch, createTickScheduler } from './shared';
export { action, selector, createSelectors, createActions } from './store/actions';
export { createStore } from './store/createStore';
export { onMounted, onUnmounted, onUpdated } from './lifecycle';
export { effect, isReactive } from '@vue/reactivity';

export type WatchOptions = WatchOptionsType;