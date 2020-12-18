export interface Store<T = any> {
    getState: () => T;
    dispatch: Dispatch;
}

export interface Action {
    type: string;
}

export type CreateStore = (state: any, enhancer?: StoreEnhancer) => Store;

export type StoreEnhancer = (next: CreateStore) => CreateStore;

export type Dispatch = (action: any) => void;

export type Middleware = (store: Store) => (next: (action: any) => void) => (action: any) => void;


export type Handler = <S, A>(state: S, action: A) => void;
export type HandlerDefinition = [Handler, (string | [string])];
export type HandlerMap = HandlerDefinition[];