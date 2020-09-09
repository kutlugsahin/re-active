import { observer, reactive, ObserverComponent } from '@re-active/react';
import React, { Component, forwardRef, PureComponent, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { observable } from 'mobx';
import { observer as mobxObserver } from "mobx-react";

const count = reactive(0);

interface CounterProps {
	data: number;
}

export const Counter = observer((props: CounterProps, ref) => {
	const [clicks, setClicks] = useState(0);

	useImperativeHandle(ref, () => ({
		alert() {
			alert('sfsdf');
		}
	}))

	return (
		<div>
			<button onClick={() => { setClicks(p => p + 1); setClicks(p => p + 1); }}>{clicks}</button>
			<button onClick={() => { count.value++; count.value++}}>{count.value}</button>
			<div>
				Data: {props.data}
			</div>
		</div>
	)
})



export const ObserverComp = observer(() => {
	const counteRef = useRef(null);

	const [data, setData] = useState(0);

	function alert() {
		counteRef.current.alert();
	}

	const ref = useRef(null);

	return (
		<div>
			<Counter ref={counteRef} data={data} />
			<button onClick={alert}>Alert</button>
			<button onClick={() => setData(data + 1)}>Inc</button>
			<ObserverClassComp ref={ref}/>
		</div>
	);
})

export class ObserverClassComp extends ObserverComponent<any, any> {
	state = {
		click: 0
	}

	deneme() { }

	render() {
		return (
			<div>
				<div>{count.value}</div>
				<div>{this.state.click}</div>
				<button onClick={() => count.value++}>Inc</button>
				<button onClick={() => this.setState({ click: this.state.click + 1 })}>Inc</button>
			</div>
		)
	}
};


const MobxComp = mobxObserver((props: any) => {
	const [state, setState] = useState(0);
	console.log('renders');

	useEffect(() => {
		setState(props.data.x);
	}, [props.data.x]);

	return (
		<div>{state}</div>
	)
});

export const MobxParent = () => {
	const [data, setData] = useState({x:0});
	const [x, setX] = useState(0);

	return (
		<div>
			<div>{data.x}</div>
			<MobxComp data={data} />
			<button onClick={() => { data.x++; setData(data)}}>AA</button>
			<button onClick={() => setX(x + 1)}>AA</button>
		</div>
	)
}