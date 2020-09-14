import { box, Box } from '@re-active/core';

export type State = { [key: string]: any };

let _store: Box<State> = box({});

export const createStore = <S extends State>(state: S) => {
	_store.value = state;
};

export const getGlobalStore = () => _store.value;
