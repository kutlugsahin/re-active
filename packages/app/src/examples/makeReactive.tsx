import { makeReactive, reactive } from '@re-active/react';
import React, { useState } from 'react';

const count = reactive(0);

export const ReactiveComp = makeReactive(() => {
	const [clicks, setClicks] = useState(0);

	return (
		<div>
			<button onClick={() => setClicks(clicks + 1)}>{clicks}</button>
			<button onClick={() => count.value++}>{count.value}</button>
		</div>
	)
})