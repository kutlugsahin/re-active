import { box, Box, Callback, Reactive, reactive } from '@re-active/core';

const resetListeners = new Set<Callback>();

export type State = { [key: string]: any };

let _store: Reactive<State>;

export const createStore = <S extends State>(state: S) => {
	if (_store) {
		_store = reactive(state);

		for (const listener of resetListeners) {
			listener();
		}
	} else {
		_store = reactive(state);
	}
};

export const getGlobalStore = () => _store;


export const addResetListener = (clb: Callback) => {
	resetListeners.add(clb);
}