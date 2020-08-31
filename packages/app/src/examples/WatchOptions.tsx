
import { createComponent, onMounted, onUpdated, reactive, watch } from '@re-active/react';

import React from 'react';

export const WatchOptions = createComponent(() => {

    const count = reactive.box(0);
    const click = reactive.box(0);
    let button: HTMLButtonElement;
    let span: HTMLSpanElement;
    let span2: HTMLSpanElement;

    onMounted(() => {
        console.log('on mouted')
    })

    onUpdated(() => {
        // console.log('on---updated');
    })

    watch(count, (val) => {
        // console.log('count updated');
        if (span) {
            span.innerText = 'Flush: pre ==> current value:' + val + ', ' + 'current html:' + button?.innerHTML;
        }
    }, {
        flush: 'pre',
        immediate: true,
    })

    watch(count, (val) => {
        // console.log('count updated');
        if (span) {
            span2.innerText = 'Flush: post ==> current value:' + val + ', ' + 'current html:' + button?.innerHTML;
        }
    }, {
        flush: 'post',
        immediate: true,
    })

    function update() {
        count.value++;
        count.value++;
        // console.log('asdas', count.value)
    }

    // watch(() => click.value, (val) => {
    //     console.log('click value:', val);
    // })

    return () => (
        <div>
            <div>
                <button ref={e => button = e} onClick={update}>Count: {count.value}</button>
                <button onClick={() => click.value++}>Click</button>
            </div>
            <div>
                <span ref={r => span = r}></span>
            </div>
            <div>
                <span ref={r => span2 = r}></span>
            </div>
        </div>
    )
})