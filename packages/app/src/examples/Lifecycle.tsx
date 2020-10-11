import React from "react";
import {
  createComponent,
  reactive,
  onMounted,
  onUnmounted,
  useContext, onBeforePaint, onUpdated, onBeforeRender, toBox
} from "@re-active/react";

export const Lifecycle = createComponent(() => {
  const { inc, count } = counter();
  let span;

  onMounted(() => {
    console.log('Lifecycle onMounted');
  })

  onBeforeRender(() => {
    console.log('Lifecycle onBeforeRendered: count' + count.value + ' text: ' + span?.innerText );
  })

  onBeforePaint(() => {
    console.log('Lifecycle onBeforePaint: count' + count.value + ' text: ' + span.innerText);
  })


  onUpdated(() => {
    console.log('Lifecycle onUpdated');

  })

  return () => <div>
    <span ref={e => span = e}>{count.value}</span><span> seconds passed</span>
    <button onClick={inc}>increment</button>
  </div>;
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
