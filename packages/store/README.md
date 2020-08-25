# Re-active Store

This is the single store state management library of re-active framework. Store is fully reactive and reactivity model is applied during the read or write operations. The created store object is accessible through selectors and actions and direct access is not possible. This architecture provides a structured state management as your application grows

## Creating the store

Store is created by **createStore** function which accepts an object in the shape of your state. Basically creates a **reactive** object to be comsumed. The object provided to createStore will be the default state.

```ts
import { createStore } from '@re-active/store'

export interface TodoItem {
	text: string;
	isCompleted: boolean;
	dateCreated: number;
	isEditing: boolean;
}

interface StoreState {
	todos: TodoItem[];
	filter: 'all' | 'active' | 'completed';
}

// a simple store for a todo app
createStore<StoreState>({
    todos: [],
    filter: 'all',
})

```

## Selectors

The read operations of the store is done by **selector**s. The state is passed to selector functions to be used to construct a return value. The result of the selector is a **computed** value which means the result is cached and reused unless any reactive dependency has changed.

### selector
```tsx
// some-selectors.ts
import { selector } from '@re-active/store'

export const leftTodosCount = selector((state: StoreState) => {
    return state.todos.filter(p => p.isCompleted === false).length;
})

// component.ts
import { leftTodosCount } from './some-selectors';

const TodoCountComponent = createComponent(() => {

    return () => <div>Remaining Todo count: {leftTodosCount.value}</div>
})
```
### createSelectors
Provides combined and easy way of creating selectors which also helps to group selectors into logical objects.

```tsx
// todo-selectors.ts
import { createSelectors } from '@re-active/store';

export const todoSelectors = createSelectors({
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
});

// component.ts
import { todoSelectors } from './todo-selectors';

const TodoCountComponent = createComponent(() => {

    // selectors created by createSelectors does not have 'value'. Direct acceess is possible.
    return () => <div>Remaining Todo count: {todoSelectors.leftTodosCount}</div>
})
```

## Actions

Actions are the functions for mutating the state. Can be sync async or generator function.
The first parameter of the function passed **action** is the state. The rest of the parameters are passed during the call of that action

### Sync Action

An action created by passing a sync function. Calling the action returns the value returned from the action function.

```js

// actions.ts
import { action } from '@re-active/store';

const setFilter = action((state: StoreState, filter: string) => {
    state.filter = filter;
})

// some-component.ts
...
setFilter('completed');

```


### Async Action

An action created by passing a async function. Calling the action returns promise of the value returned from the action function.
```js

// actions.ts
import { action } from '@re-active/store';

const loadInitialTodos = action(async (state: StoreState) => {
    const todos = await fetchTodos();
    state.todos = todos;
})

// some-component.ts
...
const loader = loadInitialTodos();

// not necessary but can be useful in some cases like showing a loading indicator without messing up the store
loader.then(() => {
    console.log('todos are loaded')
})

```
### Generator Action

An action created by passing a async function. Calling the action returns cancelable promise of the value returned from the action function.

```js

// actions.ts
import { action } from '@re-active/store';

const loadInitialTodos = action(function*(state: StoreState) {
    const todos = yield fetchTodos();
    state.todos = todos;
})

// some-component.ts
...
const loader = loadInitialTodos();

// not necessary but can be useful in some cases like showing a loading indicator without messing up the store
loader.then(() => {
    console.log('todos are loaded')
})

// if we call cancel the generator action and if we assume we called this before fetchTodos return, state.todos won't get updated. This can not be achieved by async actions.
loader.cancel();

```

### createActions

Just like createSelectors this is provides structured and easy way of creating actions.

```ts
import { createActions } from '@re-active/store';

const todoActions = createActions({
    // sync action
    setFilter(state: StoreState, filter: string) {
        state.filter = filter
    },
    // generator action
    *loadInitialTodos(state: StoreState) {
        const todos = yield fetchTodos();
        state.todos = todos;
    },
    // async action
    async addTodo(state: StoreState, todo: TodoItem){
        state.todos.push(todo);
        await saveTodo(todo); // posting to server
    }
})

// some-component.ts
...
todoActions.loadInitialTodos(); // returns cancelable promise since it's a generator action
...
todoActions.addTodo(new TodoItem('todo text'));
```

## Watchers and Effects

We can create watchers and effects for any value in the state for creating side effects. They work basically the same as **watch** and **effect** in re-active/react package but these have access to the state.

### watchStore and effectStore

```ts
import { watchStore, effectStore } from '@re-active/store';

watchStore((state: StoreState) => {
     // we access the inner values of todo list to make watcher reactive to any change 
     // Either update in todo list or any todo item field.
    return state.todos.map(p => {...p});
}, (newValue) => {
    // saving todos whenever todo list is updated or any item in the list is updated.
    saveTodos(newValue);
})

effectStore((state: StoreState) => {
    // logs filter whenever it's updated
    console.log(`Filter is changed to: ${state.filter}`)
})
```

