import React from 'react';
import { box, createComponent, reactive } from '@re-active/react';


export const Reactivity = createComponent(() => {
	const shallow = reactive.shallow({
		reactive: 0,
		nested: {
			nonReactive: 0,
		}
	});

	const shallowBox = box.shallow({
		nonReactive: 0,
	});

	return () => {
		return (
			<div style={{display:'flex'}}>
				<div>
					<div>
						<label>Shallow Reactive</label>
						<button onClick={_ => shallow.reactive++}>{shallow.reactive}</button>
					</div>
					<div>
						<label>Shallow Non Reactive</label>
						<button onClick={_ => shallow.nested.nonReactive++}>{shallow.nested.nonReactive}</button>
					</div>
				</div>
				<div>
					<div>
						<label>Shallow Box Reactive</label>
						<button onClick={_ => shallowBox.value = {nonReactive: shallowBox.value.nonReactive +1}}>{shallowBox.value.nonReactive}</button>
					</div>
					<div>
						<label>Shallow Non Reactive</label>
						<button onClick={_ => shallowBox.value.nonReactive++}>{shallowBox.value.nonReactive}</button>
					</div>
				</div>
			</div>
		)
	}
})