import { CreateStore, Middleware, StoreEnhancer, Dispatch } from './types';

export function compose(...funcs: Function[]) {
    if (funcs.length === 0) {
        // infer the argument type so it is usable in inference down the line
        return <T>(arg: T) => arg
    }

    if (funcs.length === 1) {
        return funcs[0]
    }

    return funcs.reduce((a, b) => (...args: any) => a(b(...args)))
}

export const applyMiddleware: (...middlewares: Middleware[]) => StoreEnhancer =
    (...middlewares: Middleware[]) => (createStore: CreateStore) => (initialState: any) => {
        const store = createStore(initialState);

        const middlewaresWithStore = middlewares.map(mdl => mdl(store));

        const dispatch = compose(...middlewaresWithStore)(store.dispatch);

        return {
            ...store,
            dispatch
        }
    }
