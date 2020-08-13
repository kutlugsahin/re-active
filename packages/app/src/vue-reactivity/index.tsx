import { createComponent, imperativeHandle, onMounted, reactive, useContext, watch } from "@re-active/react";
import React, { createContext, Ref, RefObject } from 'react';
import '../style.css';
interface Item {
	name: string;
	id: number;
	selected: boolean;
}

const items = Array(1).fill(null).map((_, i) => ({
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

	const divRef = {
		_value: undefined,
		get current() { return this._value },
		set current(val: any) { this._value = val; }
	};
	watch(() => state.items.length, (newV) => {
		console.log(divRef.current);
	})


	function onItemClick(id: number) {
		state.items.find(p => p.id === id)!.selected = true;
	}


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
					2222222
					<button onClick={() => state.items.push({ name: 'kutlu', id: 333, selected: false })}>add</button>
					<button onClick={() => contextValue.name = 'ahmet'}>update</button>
					{state.items.map(item => <ListItem key={item.id} item={item} onClick={onItemClick} />)}
				</div>
			</Context.Provider>
		);
	}
})

const ListItem = createComponent((props: { item: Item, onClick: any }) => {

	const x = useContext(Context);

	let labelHandle: LabelHandle;

	return () => {
		console.log('list item render');
		return (
			<div className={props.item.selected ? 'selected' : ''} onClick={() => {
				props.onClick(props.item.id);
				labelHandle.alert()
			}}>
				<Label item={props.item} ref={e => labelHandle = e} /> {x.name}
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

const Label = createComponent.withHandle((props: LabelProps, ref: Ref<LabelHandle>) => {

	imperativeHandle(ref, {
		alert() {
			alert(props.item.name)
		},
	});

	return () => {
		console.log('label render')
		return <label>{props.item.name}</label>
	}
})