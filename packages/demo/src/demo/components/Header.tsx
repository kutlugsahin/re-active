import React from 'react';
import { computed, createComponent, reactive } from 're-active';
import { actions } from '../store';

export const Header = createComponent(() => {
	const todoText = reactive('');

	const isLongEnough = computed(() => {
		return todoText.value.length > 3;
	})

	function createTodoItem() {
		actions.createTodo(todoText.value);
		todoText.value = '';
	}

	return () => {
		return (
			<div className="header">
				<h1>todos</h1>
				<div>{isLongEnough.value ? 'long enough' : 'type more'}</div>
				<input
					type="text"
					className="new-todo"
					value={todoText.value}
					onChange={e => todoText.value = e.target.value}
					onKeyDown={e => {
						if (e.keyCode === 13) {
							createTodoItem();
						}
					}}
				/>
			</div>
		)
	}
})