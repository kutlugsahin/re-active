import { createComponent, reactive } from "@re-active/react";
import React from "react";

const Label = createComponent((props: any) => {
  return () => <label>{props.text}</label>;
});

interface InputProps {
  value: string;
  onChange: (text: string) => void;
}

const Input = createComponent((props: InputProps) => {
  const onChange = (e) => {
    props.onChange(e.target.value);
  };

  return () => <input type="text" value={props.value} onChange={onChange} />;
});

export const Props = createComponent((props) => {
  const text = reactive('');

  function onChange(txt) {
    text.value = txt;
  }

  return () => (
    <div>
      <Input
        value={text}
        onChange={onChange}
      />
      <Label text={text} />
    </div>
  );
});
