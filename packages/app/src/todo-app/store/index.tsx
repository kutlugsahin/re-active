import { createStore, createSelectors, createActions } from '@re-active/store';
import { effect, watch } from '@re-active/react';

export interface TodoItem {
	text: string;
	isCompleted: boolean;
	dateCreated: number;
	isEditing: boolean;
}

type Filter = 'all' | 'active' | 'completed';

interface StoreState {
	todos: TodoItem[];
	filter: Filter;
}

createStore({
	todos: [] as TodoItem[],
	filter: 'all' as Filter,
})

export const values = createSelectors({
	leftTodosCount(state: StoreState) {
		return state.todos.filter(p => !p.isCompleted).length;
	},
	todos(state) {
		switch (state.filter) {
			case 'all':
				return state.todos;
			case 'active':
				return state.todos.filter(p => !p.isCompleted);
			case 'completed':
				return state.todos.filter(p => p.isCompleted);
			default:
				return []
		}
	},
	filter(state) {
		return state.filter;
	},
	todosAll(state) {
		return state.todos;
	},
});

export const actions = createActions({
	setFilter(state: StoreState, filter: Filter) {
		state.filter = filter;
	},
	createTodo(state: StoreState, text: string) {
		state.todos.unshift({
			text,
			dateCreated: Date.now(),
			isCompleted: false,
			isEditing: false,
		});
	},
	removeTodo(state: StoreState, todo: TodoItem) {
		state.todos.splice(state.todos.indexOf(todo), 1);
	},
	checkAll(state: StoreState, check: boolean) {
		state.todos.forEach(p => p.isCompleted = check);
	},
	clearCompleted(state: StoreState) {
		state.todos = state.todos.filter(p => !p.isCompleted);
	},
	populateStore(state: StoreState) {
		const todos = JSON.parse(localStorage.getItem('todos') || '[]') as TodoItem[];
		const filter = JSON.parse(localStorage.getItem('filter') || '"all"') as Filter;

		state.todos = todos;
		state.filter = filter;
		saveChanges();
	},
})


function saveChanges() {
	watch(() => {
		return {
			todos: values.todosAll,
			filter: values.filter,
		}
	}, ({ todos, filter }) => {
		localStorage.setItem('todos', JSON.stringify(todos));
		localStorage.setItem('filter', JSON.stringify(filter));
	});

	effect(() => {
		console.log(values.todosAll[0]);
	})
}

