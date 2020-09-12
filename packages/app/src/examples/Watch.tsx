import React from "react";
import { createComponent, reactive, watch } from "@re-active/react";

const User = createComponent((props: any) => {
  const state = reactive({
    loading: true,
    data: null
  });

  watch(
    () => props.id,
    (newId) => {
      state.loading = true;
      setTimeout(() => {
        state.data = {
          id: newId,
          name: `user ${newId}`
        };
        state.loading = false;
      }, 1000);
    }
  );

  return () => (state.loading ? <div>Loading</div> : <div>{state.data.name}</div>);
});

export const Watch = createComponent((props: any) => {
  const userId = reactive(0);

  return () => (
    <div>
      <input type="number" onChange={(e) => (userId.value = +e.target.value)} />
      <div>
        <User id={userId.value} />
      </div>
    </div>
  );
});
