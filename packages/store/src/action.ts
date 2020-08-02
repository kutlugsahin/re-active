import { getGlobalStore } from './createStore';

export type OmitStateParameter<T extends (state: any, ...params: any[]) => any> = T extends (state: any, ...params: infer P) => any ? P : never;

export type FunctionWithoutState<T extends (state: any, ...params: any[]) => any> = (...p: OmitStateParameter<T>) => ReturnType<T>;

export const action = <T extends (s: any, ...p: any[]) => any>(fn: T): FunctionWithoutState<T> => {
	return (...params: OmitStateParameter<T>) => {
		return fn(getGlobalStore() as any, ...params);
	}
}

export type Dictionary<T> = { [key: string]: T };

export type Action<S = any> = (s: S, ...params: any[]) => void;
export type ActionMap<S = any> = { [key: string]: Action<S> }
export type ActionMapWithoutState<T extends ActionMap> = { [key in keyof T]: FunctionWithoutState<T[key]> }

type Actions<T extends Dictionary<Action>> = { [key in keyof T]: FunctionWithoutState<T[key]> }
export const createActions = <S, T extends Dictionary<Action<S>>>(actions: T): Actions<T> => {

	const result: any = {};

	for (const key in actions) {
		if (Object.prototype.hasOwnProperty.call(actions, key)) {
			result[key] = action(actions[key]);
		}
	}

	return result as Actions<T>;
}

