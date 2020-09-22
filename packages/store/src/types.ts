import { Disposer, Reactive } from '@re-active/core';

export type OmitStateParameter<T extends (state: any, ...params: any[]) => any> = T extends (state: any, ...params: infer P) => any ? P : never;

export type Action = (...params: any[]) => any;

export type SyncAction = (...p: any[]) => any;
export type AsyncAction = (...p: any[]) => Promise<any>;
export type GeneratorAction = (...p: any[]) => Generator<any, any, any>;

export type ActionGenerator<TReturn = any> = Generator<any, TReturn, any>;

export type Actionize<T extends Action>=
    T extends GeneratorAction ?
    (...params: OmitStateParameter<T>) => CancelablePromise<GeneratorReturn<T>> :
    T extends Action ? (...params: OmitStateParameter<T>) => ReturnType<T> : never;

export type Callable<T extends Action> = T extends GeneratorAction ?
    (...params: Parameters<T>) => CancelablePromise<GeneratorReturn<T>> : (...params: Parameters<T>) => ReturnType<T>;

export type Dictionary<T> = { [key: string]: T };

export type ActionMap = Dictionary<Action | Dictionary<any>>;
// export type ActionMapWithoutState<T extends ActionMap> = { [key in keyof T]: FunctionWithoutState<T[key]> }

export type Actions<T extends Dictionary<Action | Object>> = { [key in keyof T]: T[key] extends Action ? Actionize<T[key]> : T[key] extends Dictionary<any> ? Actions<T[key]> : never}


export type CancelablePromise<T> = Promise<T> & { cancel: () => void }

export type GeneratorReturn<T> = T extends (...p: any[]) => Generator<any, infer R, any> ? R : T extends (...p: any[]) => Generator<unknown, infer K, unknown> ? K : never;



export interface AbortPromise<T = undefined> {
    promise: () => Promise<T>;
    abort: () => void;
}

export type Callback<T> = (param: T) => void
export type Signal<T> = {
    (param: T): void;
    listen: (clb: Callback<T>) => () => void;
}

export type Selector = (...p: any[]) => any;
export type SelectorMap = Dictionary<Selector | Dictionary<any>>;
export type Selectors<T extends SelectorMap> = { [key in keyof T]: T[key] extends Selector ? ReturnType<T[key]> : T[key] extends Dictionary<any> ? Selectors<T[key]> : never };


export type EffectCreator = (store: any) => Disposer;
export type EffectMap = Dictionary<EffectCreator | Dictionary<any>> | undefined;
export type Effects<T extends EffectMap> = { [key in keyof T]: T[key] extends EffectCreator ? Disposer : T[key] extends Dictionary<any> ? Effects<T[key]> : never };

export type StoreDefinition = {
    state: any,
    selectors: SelectorMap;
    actions: ActionMap;
    effects?: EffectMap;
}

export interface Store<T extends StoreDefinition = any> {
    state: Reactive<T['state']>;
    selectors: Selectors<T['selectors']>;
    actions: Actions<T['actions']>;
    effects?: Effects<T['effects']>
}