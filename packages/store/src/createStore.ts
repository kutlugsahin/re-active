import { reactive, WatchOptions, watch } from '@re-active/core'

export type State = { [key: string]: any };

let _store: State;

export const createStore = <S extends State>(state: S) => {
	_store = reactive(state);
};

export const getGlobalStore = () => _store;

export const watchStore = <T extends (s: any) => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
	return watch(() => fn(_store), clb, options);
}