export type OmitStateParameter<T extends (state: any, ...params: any[]) => any> = T extends (state: any, ...params: infer P) => any ? P : never;

// export type FunctionWithoutState<T extends (state: any, ...params: any[]) => any> = (...p: OmitStateParameter<T>) => ReturnType<T>;

export type Action<S = any, R = any> = (s: S, ...params: any[]) => R;

export type SyncAction = (s: any, ...p: any[]) => any;
export type AsyncAction = (s: any, ...p: any[]) => Promise<any>;
export type GeneratorAction = (s: any, ...p: any[]) => Generator<any, any, any>;

export type ActionGenerator<TReturn = any> = Generator<any, TReturn, any>;

export type Actionize<T extends Action> = T extends GeneratorAction ?
    (...params: OmitStateParameter<T>) => CancelablePromise<GeneratorReturn<T>> : (...params: OmitStateParameter<T>) => ReturnType<T>;

export type Dictionary<T> = { [key: string]: T };

// export type ActionMap<S = any> = { [key: string]: Action<S> }
// export type ActionMapWithoutState<T extends ActionMap> = { [key in keyof T]: FunctionWithoutState<T[key]> }

export type Actions<T extends Dictionary<Action>> = { [key in keyof T]: Actionize<T[key]> }


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