import { reactive } from "@vue/reactivity"

export type State = { [key: string]: any };

let _store: State;

export const createStore = <S extends State>(state: S) => {
	_store = reactive(state);
};

export const getGlobalStore = () => _store;