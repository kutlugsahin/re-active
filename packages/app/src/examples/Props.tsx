import React from "react";
import { createComponent, reactive } from "@re-active/react";

const Label = createComponent((props: any) => {
  return () => <label>{props.text}</label>;
});

const Input = createComponent((props: any) => {
  const onChange = (e) => {
    props.onChange(e.target.value);
  };

  return () => <input type="text" value={props.value} onChange={onChange} />;
});

export const Props = createComponent((props) => {
  const state = reactive({
    inputText: ""
  });

  return () => (
    <div>
      <Input
        value={state.inputText}
        onChange={(text) => (state.inputText = text)}
      />
      <Label text={state.inputText} />
    </div>
  );
});
