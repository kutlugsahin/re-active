import React from "react";
import { createComponent, reactive } from "@re-active/react";

export const ReRender = createComponent(() => {
  let renderCount = 0;

  const state = reactive({
    clicks: 0,
    doesNotEffectRender: 0
  });

  return () => {
    return (
      <div>
        <button onClick={() => state.clicks++}>{state.clicks}</button>
        <button
          onClick={() => {
            // doesNotEffectRender is not referenced during render
            // which means it does not affect the rendered result
            // that's why updating this variable does not cause render
            state.doesNotEffectRender++;
          }}
        >
          Update unreferenced reactive variable
        </button>
        <span>Component rendered {++renderCount} times</span>
      </div>
    );
  };
});
