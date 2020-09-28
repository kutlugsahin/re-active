import { observer, reactive, ObserverComponent, Observer, box, useReactive } from '@re-active/react';
import React, { Component, forwardRef, PureComponent, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { observable } from 'mobx';
import { observer as mobxObserver } from "mobx-react";

const count = reactive(0);

interface CounterProps {
	data: number;
}

export const Counter = observer((props: CounterProps, ref) => {
	const clicks = useReactive(0);

	useImperativeHandle(ref, () => ({
		alert() {
			alert('sfsdf');
		}
	}))

	return (
		<div>
			<button onClick={() => { clicks.value++; clicks.value++ }}>XX {clicks.value}</button>
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

export class ObserverClassComp extends ObserverComponent {
	state = {
		click: 0
	}

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

export const ObserverClassComp2 = observer(class extends Component {
	state = {
		click: 0
	}

	render() {
		console.log('obs comp 2 render')
		return (
			<div>
				<Observer>
					{() => (
						<div>{count.value}</div>
					)}
				</Observer>
				<div>{this.state.click}</div>
				<button onClick={() => count.value++}>Inc</button>
				<button onClick={() => this.setState({ click: this.state.click + 1 })}>Inc</button>
				
			</div>
		)
	}
});

export class Counter2 extends ObserverComponent {
	count = reactive(0);

	increment = () => {
		this.count.value++;
	};

	ads = box(null);

	render() {

		this.ads.value
		// When increment button pressed. this component won't render
		// Because the reactive value is used by the inner Observer component
		// Only Observer will render again
		console.log('Counter Rendered');
		return (
			<div>
				<Observer>
					{() => <span>{this.count.value}</span>}
				</Observer>
				<Counter data={3}/>
				<button onClick={this.increment}>increment</button>
			</div>
		)
	}
} 

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