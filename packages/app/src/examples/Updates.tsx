import React from 'react';
import { createComponent, reactive } from '@re-active/react';

export const Updates = createComponent(() => {
    let tick = 0;

    const count = reactive(0);

    async function update() {
        await count.value++;
        await count.value++;
        await count.value++;
        await count.value++;
    }

    return () => {
        console.log(`render ${tick++}`);
        return (
            <div>
                <div>{count.value}</div>
                <button onClick={update}>update</button>
            </div>
        );
    }
})