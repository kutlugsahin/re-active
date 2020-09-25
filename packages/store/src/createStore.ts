import { box, Box, Callback, isBox, markRaw, reactive } from '@re-active/core';

let _isReactivityDisabled = typeof window === 'undefined';

interface Listener { destroy: Callback, onStateUpdate?: Callback };

const stateListeners = new Set<Listener>();

export type State = { [key: string]: any };

export enum StateType {
	none,
	reactive,
	plain
}

let _store: Box<State> | { value: State } = box({});
let _stateType = StateType.none;

function destroyListeners() {
	stateListeners.forEach(p => p.destroy());
}

export const setStoreState = <S extends State>(state: S) => {
	if (_isReactivityDisabled) {
		_stateType = StateType.plain;
		_store = {
			value: reactive(markRaw(state))
		};
	} else {
		_stateType = StateType.reactive;
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
	_stateType = StateType.none;
	destroyListeners();
	_store.value = {};
}

export const getGlobalStore = () => {
	if (_stateType !== StateType.none) {
		return _store.value;
	}

	throw "Store State is not set. You must set the state before accessing state";
};
export const getStateType = () => _stateType;


export const addResetListener = (listener: Listener) => {
	stateListeners.add(listener);
}

export const disableReactivity = (disable: boolean = true) => {
	_isReactivityDisabled = disable;
}

export const isReactivityDisabled = () => _isReactivityDisabled;