import React, { useState, useEffect, createContext } from "react"
import { createComponent, useContext, reactive, onMounted, onUnmounted, Box } from "@re-active/react";



const useInterval = () => {
	const [val, setVal] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => setVal(val => val + 1), 1000);
		return () => clearInterval(timer);
	}, [])

	return val;
}

const interval = () => {
	const val = reactive(0);
	let timer;
	onMounted(() => {
		timer = setInterval(() => val.value++, 500);
	})
	onUnmounted(() => {
		clearInterval(timer);
	})
	return val;
}

const SecondsContext = createContext<number>(null!);
const HalfSecondsContext = createContext<Box<number>>(null!);

export const WithReactComponents = () => {
	const val = useInterval();


	return (
		<div>
			<SecondsContext.Provider value={val}>
				<ContextProviderComponent>
					<ReactiveComp />
				</ContextProviderComponent>
			</SecondsContext.Provider>
		</div>
	);
}

const ContextProviderComponent = createComponent((props:any) => {
	const data = interval();

	return () => (
		<HalfSecondsContext.Provider value={data}>
			{props.children}
		</HalfSecondsContext.Provider>
	)
})

const ReactiveComp = createComponent((props: any) => {
	const seconds = useContext(SecondsContext);
	const halfSeconds = useContext(HalfSecondsContext);

	return () => {
		return (
			<div>{seconds.value} / {halfSeconds.value}</div>
		)
	}
});