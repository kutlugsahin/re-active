import React from "react";
import {
  createComponent,
  reactive,
  onMounted,
  onUnmounted,
  useContext
} from "@re-active/react";

export const Lifecycle = createComponent(() => {
  const seconds = timer();

  return () => <div>{seconds.value} seconds passed</div>;
});

function timer() {
  let interval;

  const seconds = reactive(0);

  onMounted(() => {
    interval = setInterval(() => {
      seconds.value++;
    }, 1000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  return seconds;
}
