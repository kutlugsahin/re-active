import React from "react";
import { createComponent, reactive } from "@re-active/react";

const state = reactive({
  clicks: 0
});

const Button = createComponent(() => {
  return () => (
    <button onClick={() => state.clicks++}>Clicks: {state.clicks}</button>
  );
});

const Label = createComponent(() => {
  return () => <span>{state.clicks}</span>;
});

export const SharedState = () => {
  return (
    <div>
      <Button />
      <Label />
      <Button />
      <button onClick={() => (state.clicks = 0)}>Reset</button>
    </div>
  );
};
