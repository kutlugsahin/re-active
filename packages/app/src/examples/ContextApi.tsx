import React from "react";
import {
  createComponent,
  reactive,
  useContext,
  effect
} from "@re-active/react";

const Context = React.createContext(null!);

const Label = createComponent((props) => {
  const context = useContext(Context);
  return () => <label>{context.text}</label>;
});

export const ContextApi = createComponent((props) => {
  const contextValue = reactive({ text: "" });

  return () => (
    <div>
      <input
        value={contextValue.text}
        onChange={(e) => (contextValue.text = e.target.value)}
      />
      <Context.Provider value={contextValue}>
        <Label />
      </Context.Provider>
    </div>
  );
});