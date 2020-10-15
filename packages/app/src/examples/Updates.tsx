import React, { useEffect } from 'react';
import { createComponent, onUpdated, reactive } from '@re-active/react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

export const Updates = createComponent(() => {
    let tick = 0;

    const count = reactive(0);

    async function update() {
        await count.value++;
        await count.value++;
        await count.value++;
        count.value++;
        count.value++;
        count.value++;
        count.value++;
    }

    onUpdated(() => {
        console.log('updated');
    })

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

// const count = observable({
//     value: 0,
// });

// export const Updates = observer(() => {

//     async function update() {
//         await count.value++;
//         await count.value++;
//         await count.value++;
//         count.value++;
//         count.value++;
//         count.value++;
//         count.value++;
//     }

//     useEffect(() => {
//         console.log('rendered');
//     })

//     return (
//         <div>
//             <div>{count.value}</div>
//             <button onClick={update}>update</button>
//         </div>
//     );

// })
