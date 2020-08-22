import React from "react";
import { createComponent, reactive, imperativeHandle } from "@re-active/react";

// works like React.forwardRef
const Input = createComponent.withHandle((props, ref) => {
  // we can keep a reference to input element simple as this
  let input;

  imperativeHandle(ref, {
    focus() {
      input.focus();
    }
  });

  return () => <input ref={(r) => (input = r)} />;
});

export const ImperativeHandle = createComponent((props) => {
  // classic react ref can also be used
  const inputRef = React.createRef<HTMLInputElement>();

  function focus() {
    inputRef.current.focus();
  }

  return () => (
    <div>
      <Input ref={inputRef} />
      <button onClick={focus}>Focus to input</button>
    </div>
  );
});
