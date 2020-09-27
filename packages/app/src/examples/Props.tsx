import { createComponent, observer, reactive } from "@re-active/react";
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

const ObserverProps = observer((props: {clicks: number, unused: number, onClick: () => void}) => {

  return (
    <div>
      {props.clicks}
      <button onClick={props.onClick}>Click Count ++</button>
    </div>
  )
})

export const Props = createComponent((props) => {
  const text = reactive('');
  const click = reactive(0);
  const unused = reactive(0);

  function onChange(txt) {
    text.value = txt;
  }

  function onClick() {
    click.value++;
    unused.value++;
  }

  return () => (
    <div>
      <Input
        value={text}
        onChange={onChange}
      />
      <Label text={text} />
      <div>
        <ObserverProps clicks={click} onClick={onClick} unused={unused} />
      </div>
    </div>
  );
});
