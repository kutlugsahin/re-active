import React from 'react';
import { createComponent } from '@re-active/react';
import { actions, TodoItem } from '../store';

interface ListItemProps {
	todo: TodoItem;
}

export const ListItem = createComponent(({ todo }: ListItemProps) => {
	function getItemClass() {
		let classes = [];

		if (todo.isCompleted) classes.push('completed');
		if (todo.isEditing) classes.push('editing');

		return classes.join(' ');
	}

	function removeTodoItem() {
		actions.removeTodo(todo);
	}

	function onCheckChanged(checked: boolean) {
		todo.isCompleted = checked;
	}

	function setIsEditing(isEditing: boolean) {
		todo.isEditing = isEditing;
	}

	function updateTodoText(text: string) {
		todo.text = text;
	}

	return () => (
		<li className={getItemClass()}>
			<div className="view">
				<input className="toggle" type="checkbox" checked={todo.isCompleted} onChange={e => onCheckChanged(e.target.checked)} />
				<label onDoubleClick={() => setIsEditing(true)}>{todo.text}</label>
				<button className="destroy" onClick={removeTodoItem}></button>
			</div>
			<input className="edit" value={todo.text} onChange={e => updateTodoText(e.target.value)} onKeyDown={e => {
				if (e.keyCode === 13) {
					setIsEditing(false);
				}
			}} />
		</li>
	)
})