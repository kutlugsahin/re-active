
import { createComponent, observer, onMounted, onUpdated, reactive, useReactive, useWatch, watch } from '@re-active/react';

import React, { useRef } from 'react';

export const WatchOptions = createComponent(() => {

    const count = reactive(0);
    const click = reactive(0);
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

export const WatchOptionsObserver = observer(() => {
    const count = useReactive(0);
    const click = useReactive(0);
    let button = useRef(null);
    let span = useRef(null);
    let span2 = useRef(null);

    // useWatch(count, (val) => {
    //     // console.log('count updated');
    //     if (span.current) {
    //         span.current.innerText = 'Flush: pre ==> current value:' + val + ', ' + 'current html:' + button.current.innerHTML;
    //     }
    // }, {
    //     flush: 'pre',
    //     immediate: true,
    // })

    // useWatch(count, (val) => {
    //     // console.log('count updated');
    //     if (span.current) {
    //         span2.current.innerText = 'Flush: post ==> current value:' + val + ', ' + 'current html:' + button.current.innerHTML;
    //     }
    // }, {
    //     flush: 'post',
    //     immediate: true,
    // })

    function update() {
        count.value++;
        count.value++;
        // console.log('asdas', count.value)
    }

    return (
        <div>
            <div>
                <button ref={button} onClick={update}>Count: {count.value}</button>
                <button onClick={() => click.value++}>Click</button>
            </div>
            <div>
                <span ref={span}></span>
            </div>
            <div>
                <span ref={span2}></span>
            </div>
        </div>
    )
})