import { reactive } from '@re-active/core';
import { CreateStore, Reducer, StoreEnhancer } from './types';

export { applyMiddleware } from './applyMiddleware';
export { handlerMiddleware } from './handlerMiddleware';
export type { Action, CreateStore, Dispatch, Handler, HandlerDefinition, HandlerMap, Middleware, Store, StoreEnhancer } from './types'

export const createStore: CreateStore = (rootReducer: Reducer, enhancer?: StoreEnhancer, initialState?: any) => {

    if (enhancer) {
        return enhancer(createStore)(initialState);
    }

    const state = rootReducer(initialState, { type: '@Init' });

    const reactiveStore = reactive(state);

    return {
        getState() {
            return reactiveStore;
        },
        dispatch<T>(action: T): T {
            rootReducer(state, action);
            return action;
        }
    }
}