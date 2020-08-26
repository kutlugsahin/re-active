import { getGlobalStore } from './createStore';
import { generatorFlow } from './flow';
import { Action, Actionize, Actions, Callable, Dictionary, OmitStateParameter } from './types';
import { getActionWatcher } from './watch';

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
			const result = Reflect.apply(target, ctx, params);

			const actionWatcher = getActionWatcher();

			if (actionWatcher) {
				const actionName: string = proxyFn.displayName || actionized.displayName;
				actionWatcher(actionName, params, result);
			} 

			return result;
		}
	})

	return proxyFn as Actionize<T>;
}

export const createActions = <S, T extends Dictionary<Action | Object>>(actions: T): Actions<T> => {

	function makeActionObject(actionMap: T, parentDisplayName: string = '') {		
		const result: any = {};

		for (const key in actionMap) {
			if (Object.prototype.hasOwnProperty.call(actionMap, key)) {
				const actionFn = actionMap[key] as any;
				const actionName = parentDisplayName ? `${parentDisplayName}.${key}` : key;

				if (actionFn[isAction]) {
					result[key] = actionFn;
					result[key].displayName = actionName
				} else if (typeof actionFn === 'object') {
					result[key] = makeActionObject(actionFn, actionName)
				} else {
					result[key] = action(actionMap[key] as Action);
					result[key].displayName = actionName;
				}
			}
		}

		return result;
	}

	return makeActionObject(actions) as Actions<T>;
}



