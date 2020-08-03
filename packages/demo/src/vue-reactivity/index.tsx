import { createComponent, imperativeHandle, onMounted, reactive, useContext, ref } from "@re-active/react";
import React, { createContext } from 'react';

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

const Context = createContext({
	name: 'kutlu'
});

export const List = createComponent(() => {

	const state = reactive({
		items,
	})

	function onItemClick(id: number) {
		state.items.find(p => p.id === id)!.selected = true;
	}

	const divRef = ref(null);

	onMounted(() => {
		console.log(divRef.current)
	})

	const contextValue = reactive({
		name: 'kutlu'
	})

	return () => {
		console.log('list render');
		return (
			<Context.Provider value={contextValue}>
				<div ref={divRef}>
					<button onClick={() => contextValue.name = 'ahmet'}>update</button>
					{state.items.map(item => <ListItem key={item.id} item={item} onClick={onItemClick} />)}
				</div>
			</Context.Provider>
		);
	}
})

const ListItem = createComponent((props: { item: Item, onClick: any }) => {

	const x = useContext(Context);

	let labelHandle = ref<LabelHandle>();

	return () => {
		console.log('list item render');
		return (
			<div className={props.item.selected ? 'selected' : ''} onClick={() => {
				props.onClick(props.item.id);
				labelHandle.current?.alert()
			}}>
				<Label item={props.item} ref={labelHandle}/> {x.name}
			</div>
		)
	}
})

interface LabelProps {
	item: any
}

interface LabelHandle {
	alert: () => void
};
 
const Label = createComponent.withHandle<LabelProps, LabelHandle>((props: LabelProps) => {

	imperativeHandle({
		alert() {
			alert(props.item.name)
		},
	});

	return () => {
		console.log('label render')
		return <label>{props.item.name}</label>
	}
})