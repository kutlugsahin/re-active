import { Callback, markRaw, Reactive, reactive } from '@re-active/core';

let _isRenderStatic = typeof window === 'undefined';

const resetListeners = new Set<Callback>();

export type State = { [key: string]: any };

let _store: Reactive<State>;

function releaseListeners() {
	for (const listener of resetListeners) {
		listener();
	}
}

function createReativeState(state: any) {
	if (_isRenderStatic) {
		return markRaw(state);
	}

	return reactive(state);
}

export const createStore = <S extends State>(state: S) => {
	if (_store) {
		_store = createReativeState(state);

		releaseListeners();
	} else {
		_store = createReativeState(state);
	}
};

export const disposeStore = () => {
	releaseListeners();
	_store = null!;
}

export const getGlobalStore = () => _store;


export const addResetListener = (clb: Callback) => {
	resetListeners.add(clb);
}

export const renderStatic = (isStatic: boolean = true) => {
	_isRenderStatic = isStatic;
}

export const isRenderStatic = () => _isRenderStatic;