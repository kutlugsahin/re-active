import React from "react";
import { createComponent, reactive } from "@re-active/react";

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
  const other = reactive('');

  function onChange(txt) {
      text.value.length > 5 ? other.value = txt : text.value = txt;
  }

  return () => (
    <div>
      <Input
        value={text.value.length > 5 ? other : text}
        onChange={onChange}
      />
      <Label text={text} />
    </div>
  );
});
