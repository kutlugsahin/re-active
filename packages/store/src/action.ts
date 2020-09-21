import { generatorFlow } from './flow';
import { Action, Actionize, OmitStateParameter, Dictionary, Actions, Callable } from './types';

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

const action = <T extends Action>(fn: T, getStore: () => any): Actionize<T> => {

	const callableAction = callable(fn);

	let actionized: any = (...params: OmitStateParameter<T>) => {
		return callableAction(getStore() as any, ...params);
	}

	actionized[isAction] = true;
	actionized.displayName = fn.name;

	const proxyFn = new Proxy(actionized, {
		apply(target, ctx, params) {
			const result = Reflect.apply(target, ctx, params);

			// const actionWatcher = getActionWatcher();

			// if (actionWatcher) {
			// 	const actionName: string = proxyFn.displayName || actionized.displayName;
			// 	actionWatcher(actionName, params, result);
			// }

			return result;
		}
	})

	return proxyFn as Actionize<T>;
}

export function buildActions<T extends Dictionary<Action | Dictionary<any>>>(actions: T, getStore: () => any): Actions<T> {
	return Object.keys(actions).reduce((acc: any, key) => {
		const entry = actions[key];

		if (typeof entry === 'function') {
			acc[key] = action(entry as Action, getStore);
		} else {
			acc[key] = buildActions(entry, getStore);
		}

		return acc;

	}, {} as Actions<T>);
}