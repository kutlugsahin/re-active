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

  const seconds = reactive(0);

  onMounted(() => {
    const interval = setInterval(() => {
      seconds.value++;
    }, 1000);

    return () => {
      clearInterval(interval);
    }
  });

  return seconds;
}
