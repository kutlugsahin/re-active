import React from 'react';
import { createComponent, reactive } from "re-active";

interface Item {
	name: string;
	id: number;
	selected: boolean;
}

const items = Array(10).fill(null).map((_, i) => ({
	name: `item ${i}`,
	id: i,
	selected: false,
}))

export const List = createComponent(() => {

	const state = reactive({
		items,
	})

	function onItemClick(id: number) {
		state.items.find(p => p.id === id)!.selected = true;
	}

	return () => {
		console.log('list render');
		return (
			<div>
				{state.items.map(item => <ListItem key={item.id} item={item} onClick={onItemClick} />)}
			</div>
		);
	}
})

const ListItem = createComponent((props: { item: Item, onClick: any }) => {




	return () => {
		console.log('list item render');
		return (
			<div className={props.item.selected ? 'selected' : ''} onClick={() => props.onClick(props.item.id)}>{props.item.name}</div>
		)
	}
})