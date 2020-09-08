import { observer, reactive } from '@re-active/react';
import React, { useImperativeHandle, useRef, useState } from 'react';

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
			<button onClick={() => setClicks(clicks + 1)}>{clicks}</button>
			<button onClick={() => count.value++}>{count.value}</button>
			<div>
				Data: {props.data}
			</div>
		</div>
	)
})



export const ObserverComp = observer(() => {
	const counteRef = useRef<{ alert: any }>();

	const [data, setData] = useState(0);

	function alert() {
		counteRef.current.alert();
	}

	return (
		<div>
			<Counter ref={counteRef} data={data} />
			<button onClick={alert}>Alert</button>
			<button onClick={() => setData(data + 1)}>Inc</button>
		</div>
	);
})