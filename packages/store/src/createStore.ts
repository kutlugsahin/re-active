import { types } from '@babel/core';
import { Reactive, reactive } from '@re-active/core';
import { buildActions } from './action';
import { buildSelectors } from './selector';
import { Store, StoreDefinition } from './types';
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

const a = createStore({
	state: {
		name: '',
	},
	actions: {
		loadUsers(x: typeof a, id: number) {
			a.actions.fetchItem('asda');
		},
		*fetchItem(store, name: string) {
			yield 5;
			return 'sdfsdf';
		}
	},
	selectors: {
		user({ actions }) {
			
			return 'state.name'
		}
	}
})

export type SS = typeof a;


function f() {
		
}

f.bind({ a: 1 });