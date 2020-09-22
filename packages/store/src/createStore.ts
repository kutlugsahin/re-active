import { types } from '@babel/core';
import { Reactive, reactive } from '@re-active/core';
import { buildActions } from './action';
import { buildSelectors } from './selector';
import { ActionMap, Actions, Dictionary, OmitStateParameter, Store, StoreDefinition } from './types';
import { buildEffects, watchStore } from './watch';


export const createStore = <T extends StoreDefinition>(storeDefinition: T): Store<T> => {
	const reactiveState: Reactive<T> = reactive(storeDefinition.state);

	const store: Store<T> = {
		state: reactiveState,
		selectors: buildSelectors(storeDefinition.selectors, () => store),
		actions: buildActions(storeDefinition.actions, () => store),
	}

	const effects = buildEffects(storeDefinition.effects, () => store);

	function dispose() {
		
	}

	return store;
}

const state = {
	name: '',
};


const a = createStore({
	state,
	actions: {
		loadUsers(ss, id: number) {
			const { selectors } = ss as SS;			
		},
		*fetchItem({ }, name: string) {
			yield 5;
			return 'sdfsdf';
		}
	},
	selectors: {
		user() {
			return 'state.name'
		}
	}
});

type SS = typeof a;

type FunctionMap = { [key: string]: (...p: any[]) => any };

type Enhance<T extends FunctionMap> = {
	[key in keyof T]: T[key] extends (...p: any[]) => any ? (...p: OmitStateParameter<T[key]>) => ReturnType<T[key]> : never;
}

function rr<T extends FunctionMap>(asd: T): Enhance<T> {
	return null!;
}

const x = rr({
	f(state) {
		return 5;
	}
})

