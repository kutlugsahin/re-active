import React from "react";
import {
  createComponent,
  reactive,
  useContext,
} from "@re-active/react";

const Context = React.createContext<{text: string}>(null!);

const Label = createComponent(() => {

  const context = useContext(Context);

  return () => <label>{context.value.text}</label>;
});

export const ContextApi = createComponent(() => {
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
