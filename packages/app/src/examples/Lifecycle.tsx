import React from "react";
import {
  createComponent,
  reactive,
  onMounted,onBeforePaint, onUpdated, toBox
} from "@re-active/react";

export const Lifecycle = createComponent(() => {
  const { inc, count } = counter();
  let span;

  onMounted(() => {
    console.log('Lifecycle onMounted');
  })

  onBeforePaint(() => {
    console.log('Lifecycle onBeforePaint: count' + count.value + ' text: ' + span.innerText);
  })


  onUpdated(() => {
    console.log('Lifecycle onUpdated');

  })

  return () => {
    console.log('rendered')
    return <div>
      <span ref={e => span = e}>{count.value}</span><span> seconds passed</span>
      <button onClick={inc}>increment</button>
    </div>
  };
});

function counter() {

  const seconds = reactive(0);

  return {
    count: toBox(seconds, 'value'),
    inc() {
      seconds.value++;
    }
  };
}
