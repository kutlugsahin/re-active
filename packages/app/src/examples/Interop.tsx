import React, { useCallback, useEffect, useRef, useState } from "react";
import { createComponent, onRendered } from "@re-active/react";

function generateItems(count: number = 10): Item[] {
	return Array(count).fill(null).map((_, i) => ({
		id: i,
		data: `item ${i}`
	 }))
 }

interface Item {
	id: number;
	data: string;
}

function fetchData(): Promise<Item[]> {
	return new Promise((res) => {
		setTimeout(() => {
			res(generateItems());
		}, 1000);
	})
}

interface ReactiveComponentProps {
	id: number;
	data: string;
	selected: boolean;
	onSelected: (id: number) => void;
}

const ReactiveComponent = createComponent((props: ReactiveComponentProps) => {
	let container: HTMLDivElement;

	onRendered(() => {
		container.classList.add('flash');
		setTimeout(() => {
			container.classList.remove('flash');
		}, 500)
	})

	return () => (
		<div
			ref={e => container =e}
			className={props.selected ? 'selected' : ''}
			onClick={() => props.onSelected(props.id)}
		>
			{props.data}
		</div>
	)
})


export const Interop = () => {
	const [items, setItems] = useState<Item[]>([]);
	const selectedId = useRef<number>();

	useEffect(() => {
		fetchData().then(setItems);
	}, [])

	const onSelected = useCallback((id: number) => {
		const newItems = [...items];
		const [updatedItem] = newItems.splice(id, 1);
		newItems.splice(id, 0, {
			...updatedItem,
		});
		setItems(newItems);
		selectedId.current = id;
	}, [items])

	return (
		<div>
			{items.map(item => (
				<div key={item.id}>
					<ReactiveComponent {...item} onSelected={onSelected} selected={selectedId.current === item.id}/>
				</div>
			))}
		</div>
	)
}