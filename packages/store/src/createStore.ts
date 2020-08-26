import { reactive, watch, WatchOptions } from '@re-active/core'

export type State = { [key: string]: any };

let _store: State;
let _actionWatcher: ActionWatcher;

export const createStore = <S extends State>(state: S) => {
	_store = reactive(state);
};

export const getGlobalStore = () => _store;

export const watchStore = <T extends (s: any) => any, R extends (newValue: ReturnType<T>, oldValue: ReturnType<T>) => void>(fn: T, clb: R, options?: WatchOptions) => {
	return watch(() => fn(_store), clb, options);
}


export type ActionWatcher = (actionName: string, parameters: any[], result: any) => Promise<void> | void;


export const watchActions = (watcher: ActionWatcher) => {
	_actionWatcher = watcher;
}

export const getActionWatcher = () => _actionWatcher;