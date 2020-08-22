import React from "react";
import { createComponent, reactive } from "@re-active/react";

const Button = createComponent(() => {
  const state = reactive({
    clicks: 0
  });

  return () => (
    <button onClick={() => state.clicks++}>Clicks: {state.clicks}</button>
  );
});

export const LocalState = (props) => {
  return (
    <div>
      <Button />
      <Button />
    </div>
  );
};
