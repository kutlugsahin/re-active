import { getGlobalStore } from './createStore';
import { Action, Actionize, OmitStateParameter, Dictionary, Actions, Callback } from './types';
import { generatorFlow } from './flow';

const isAction = Symbol('isAction');

enum ActionType {
	sync,
	async,
	generator
}

function getActionType(fn: Action): ActionType {
	if (fn.constructor === (function* () { }).constructor) return ActionType.generator;
	if (fn.constructor === (async function () { }).constructor) return ActionType.async;
	return ActionType.sync
}


export const action = <T extends Action>(fn: T): Actionize<T> => {
	let actionized: any;

	switch (getActionType(fn)) {
		case ActionType.generator:
			actionized = generatorFlow(fn);
			break;
		default:
			actionized = (...params: OmitStateParameter<T>) => {
				return fn(getGlobalStore() as any, ...params);
			}
			break;
	}

	actionized[isAction] = true;

	return actionized as Actionize<T>;
}


export const createActions = <S, T extends Dictionary<Action<S>>>(actions: T): Actions<T> => {

	const result: any = {};

	for (const key in actions) {
		if (Object.prototype.hasOwnProperty.call(actions, key)) {
			result[key] = action(actions[key]);
		}
	}

	return result as Actions<T>;
}

