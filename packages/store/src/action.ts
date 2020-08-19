import { getGlobalStore } from './createStore';
import { generatorFlow } from './flow';
import { Action, Actionize, Actions, Callable, Dictionary, OmitStateParameter } from './types';

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

export const callable = <T extends Action>(fn: T): Callable<T> => {
	let actionized: any;

	switch (getActionType(fn)) {
		case ActionType.generator:
			actionized = generatorFlow(fn);
			break;
		default:
			actionized = fn;
			break;
	}

	return actionized as Callable<T>;
}

export const action = <T extends Action>(fn: T): Actionize<T> => {

	const callableAction = callable(fn);

	let actionized: any = (...params: OmitStateParameter<T>) => {
		return callableAction(getGlobalStore() as any, ...params);
	}
	
	actionized[isAction] = true;
	actionized.displayName = fn.name;

	const proxyFn = new Proxy(actionized, {
		apply(target, ctx, params) {
			console.log(`${proxyFn.displayName || actionized.displayName} called with params: ${params}`)
			Reflect.apply(target, ctx, params);
		}
	})

	return proxyFn as Actionize<T>;
}

export const createActions = <S, T extends Dictionary<Action>>(actions: T): Actions<T> => {

	const result: any = {};

	for (const key in actions) {
		if (Object.prototype.hasOwnProperty.call(actions, key)) {
			const actionFn = actions[key] as any;

			if ((actionFn as any)[isAction]) {
				result[key] = actionFn;
				result[key].displayName = `${key}.${(actionFn as any).displayName}`
			} else {
				result[key] = action(actions[key]);
				result[key].displayName = key;
			}
		}
	}

	return result as Actions<T>;
}

