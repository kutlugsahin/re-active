import { reactive } from '@re-active/core';
import { CreateStore, StoreEnhancer } from './types';

export { applyMiddleware } from './applyMiddleware';
export { handlerMiddleware } from './handlerMiddleware';
export type { Action, CreateStore, Dispatch, Handler, HandlerDefinition, HandlerMap, Middleware, Store, StoreEnhancer } from './types'

export const createStore: CreateStore = (initialState: object, enhancer?: StoreEnhancer) => {
    if (enhancer) {
        return enhancer(createStore)(initialState);
    }

    const reactiveStore = reactive(initialState);

    return {
        getState() {
            return reactiveStore;
        },
        dispatch(action: any) {
            console.log(`use enhancers`);
        }
    }
}