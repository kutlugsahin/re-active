import { createComponent, observer, onUpdated, reactive, useReactive } from "@re-active/react";
import React, { useEffect, useState } from "react";

export const DependencySwitch = () => {
	const [val, setVal] = useState(true);

	return (
		<div>
			<button onClick={() => setVal(p => !p)}>{val ? 'true' : 'false'}</button>
			<div>-------------------</div>
			<ObserverComp val={val} />
			<ReactiveComp val={val} />
		</div>
	)
}

export const ObserverComp = observer((props: any) => {
	const dep1 = useReactive(0);
	const dep2 = useReactive(0);

	useEffect(() => {
		console.log('observer comp rendered');
	})

	return (
		<div>
			{props.val ? dep1.value : dep2.value}
			<button onClick={() => dep1.value ++}>inc dep1</button>
			<button onClick={() => dep2.value++}>inc dep2</button>
		</div>
	)
})

export const ReactiveComp = createComponent((props: any) => {
	const dep1 = reactive(0);
	const dep2 = reactive(0);

	onUpdated(() => {
		console.log('reactive comp rendered');
	})

	return () => {
		// console.log('reactive comp actual reander');
		return (
			<div>
				{props.val ? dep1.value : dep2.value}
				<button onClick={() => dep1.value++}>inc dep1</button>
				<button onClick={() => dep2.value++}>inc dep2</button>
			</div>
		)
	}
})