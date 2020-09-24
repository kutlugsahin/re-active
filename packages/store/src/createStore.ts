import { box, Box, Callback, isBox, markRaw, reactive } from '@re-active/core';

let _isReactivityDisabled = typeof window === 'undefined';

interface Listener { destroy: Callback, onStateUpdate?: Callback };

const stateListeners = new Set<Listener>();

export type State = { [key: string]: any };

let _store: Box<State> | { value: State } = box({});

function destroyListeners() {
	stateListeners.forEach(p => p.destroy());
}

export const setStoreState = <S extends State>(state: S) => {
	if (_isReactivityDisabled) {
		_store = {
			value: reactive(markRaw(state))
		};
	} else {
		if (_store && isBox(_store)) {
			_store.value = state;
			return;
		} else {
			_store = box(state);
		}
	}

	stateListeners.forEach(p => p.onStateUpdate?.())
};

export const disposeStore = () => {
	destroyListeners();
	_store.value = {};
}

export const getGlobalStore = () => _store.value;


export const addResetListener = (listener: Listener) => {
	stateListeners.add(listener);
}

export const disableReactivity = (disable: boolean = true) => {
	_isReactivityDisabled = disable;
}

export const isReactivityDisabled = () => _isReactivityDisabled;