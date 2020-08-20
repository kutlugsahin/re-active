# @re-active/react

This is an experimental implementation of a Reactive functional component for React inspired by Vue 3 composition api. Uses @vue/reactivity package for reactivity system.

## Installation
```js
npm i @re-active/react
```

## Defining a reactive component with **createComponent**

Reative component is very similar to a functional component. **createComponent** accepts a function that returns another function returning JSX. This allows a closure to be created which will persists as long as the component is alive.

```jsx
import { createComponent } from '@re-active/react';

const MyComponent = createComponent(() => {

    // ***************
    // Component scope
    // ***************

    return () => (               // ********
        <div>My Component</div>  // renderer
    );                           // ********
})
```

### __Component Scope__

The function given to **createComponent** will be called **only one time** creating a scope allowing us to define the local variables and state to be used by the actual renderer. Whatever we define in that scope will stay and won't be re-created in each renders. So we don't need to use **useMemo** or **useCallback** hooks to pervent things to be re-created. We have that out of the box.

So this is the place we define the state, callbacks or any variables to be used by the renderer

### __Renderer__

The renderer is the function that uses the reactive values to produce the JSX for the component. This function is used as a **computed** value by the reactivity system. It's cached and won't be called unless any dependent reactive value is changed.

### Defining state

We define state with **reactive** function which accepts any kind of value. To update it we simply mutate it.

```jsx
import { createComponent, reactive } from '@re-active/react';

const Button = createComponent(() => {

    const state = reactive({
        clicks: 0
    });

    return () => (               
        <button onClick={() => state.clicks++}>
            Clicks: {state.clicks}
        </button> 
    );                           
})
```

Reactive values can be defined in Component scope as well as outside the component to be shared by multiple components easily.

```jsx
import { createComponent, reactive } from '@re-active/react';

const state = reactive({
    clicks: 0
});

const Button = createComponent(() => {
    return () => (               
        <button onClick={() => state.clicks++}>
            Clicks: {state.clicks}
        </button>
    );                           
})

const Container = createComponent(() => {
    return () => (
        <div>
            <Button/>
            {state.clicks}
        </div>
    )
})

```

### __Reacting to props__

Props are also reactive so that they can be referenced in computed values (such as renderer function), they can be **watched** and can be used in **effect**

### __What makes a reactive component to render?__

Since the **renderer** is a computed value it reacts to any reactive value change which is referenced in the renderer. Otherwise it won't render and the component returns a cached value which means reactive components are **memoized by default** and **yields a great performance** as your application grows. This memoization is done by the reactivity system under the hood making sure no component will render unnecessarily. Reactivity is clever enough not to re-render in case an unreferenced value is changed.

```jsx
const Component = createComponent(() => {
  const state = reactive({
    clicks: 0,
    unusedValue: 0
  });

  return () => {
    return (
      <div>
        <button onClick={() => state.clicks++}>{state.clicks}</button>
        <button
          onClick={() => {
            // unusedValue is not referenced during render
            // which means it does not affect the rendered result
            // that's why updating this variable does not cause render
            state.unusedValue++;
          }}
        >
          Update unreferenced reactive variable
        </button>
      </div>
    );
  };
});
```

In the example above, the _unusedValue_ may seem to be used in the renderer at first look and the component may be expected to re-render as a result of updating this variable but this is not correct. Actually it's not used in the render and it does not affect the rendered content. It's referenced in the callback and the callback function is not part of the rendered markup. Reactive components are smart to only render if a reactive value is referenced in the resulting markup.