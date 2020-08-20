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

## Reactivity

The reativity system is all about defining reactive values and creating reactions when these reactive values are mutated. We can create **effect**s that will run when any referenced reactive value is changed, **computed** values that will be re calculated only if reactive values changed as well, we can also **watch** reactive values to compare with its previous value. @re-active/react package provides these functionalities which can be used inside component scope or anywhere in the application. @vue/reactivity package is used as the reactivity system which is fast and lightweight (3kb) library powering Vue 3. It is a standalone reactivity package and completely decoupled from Vue.js. 

- **reactive**

    reactive function accepts any type of values object, string, number, bool, arrays etc. Primity values returns a boxed result which you can access via _value_ property. Object and Array type of values can be accessed directly. Nested fields of the given object will also be reactive.

    ```js
    import { reactive } from '@re-active/react';

    const r1 = reactive('text');
    r1 = 'new text' // won't react, don't do that you will loose the reactive object
    r1.value = 'new text'; // reacts

    const r2 = reactive(0);
    r3.value = 1; // reacts

    const r3 = reactive({ 
        field: 'some text',
        nested : { 
            field: 'some other text' 
        } 
    });
    r3.nested.field = 'new text'; // reacts
    r3.field = 'new text'; // reacts
    ```
- **reactive.ref**

    It is used to make boxed reactive object and not making the nested fields reactive.

     ```js
    const r1 = reactive.ref({ field: 'text' });
    r1.value.field = 'new text'; // won't react
    r1.value = { field: 'new text' }; // will react
    ```

- **effect**: takes a function which will only run when a referenced reactive value is changed
    ```js
    import { reactive, effect } from '@re-active/react';
    
    const greet = reactive('Hello');

    effect(() => {
        console.log(`${greet.value} World`);
    })
    // prints "Hello World"

    greet.value = 'Hi'
    // prints "Hi World"
    ```

- **watch**: works like effect but the callback function is called with new and old values returned by the watcher.
    ```js
    import { reactive, watch } from '@re-active/react';
    
    const spinner = reactive(0);

    watch(() => spinner.value, (newVal, olVal) => {
        console.log(newVal, oldVal);
    })

    // won't work since spinner reference is not changing, 
    // value field should be accessed if it's a boxed reactive object
    // otherwise it's inner fields should be accessed
    watch(() => spinner, (newValue) => { console.log(newValue) })
    ```

- **computed**: caches and returns the value from calculation function. returned value is also reactive. Very useful for aggregating a data from various sources. Cached result is only invalidated if any of the referenced reactive values has changed.

    ```js
    const state = reactive({
        amount: 0,
        price: 10,
        productName: 'apple'
    });

    // computed values are lazy evaluated
    const totalPrice = computed(() => {
        console.log('total price is calculated');
        return state.amount * state.price + "$";
    });

    state.amount = 1;
    console.log(totalPrice.value);
    // prints: total price is calculated;
    // prints: 10$;

    state.price = 20;
    console.log(totalPrice.value);
    // prints: total price is calculated;
    // prints: 20$;

    state.amount = 1; // amount is set to 1 which is the same so no invalidation for computed value
    state.productName = 'banana'; // productName is not used in computed so no invalidation as well
    console.log(totalPrice.value); // no re calculation, returns cached result.
    // prints: 20$;

    // computed values can be watched
    totalPrice.watch((newVal, oldVal) => {
        if(newVal.slice(0, -1) > 500){
            alert('Too expensive');
        }
    })

    ```

## Lifecycles and Handle / Ref

Since we leverage the whole reactivity system we no longer need react hooks. No *useState* is needed since state is managed with reactive values. No *useState* and *useCallback* because whatever we define in the component scope will persist. And also no dependency arrays needed since there is no stale state scenario. React hooks needed those little hacks trying to create stateful functions in a single function. But reactive component defines a closure (component scope) to address this issue and this is how you actually define a stateful function in javascript by the nature of the language  

- **onMounted**: accepts a callback to be called when the component is mounted
- **onUnmounted** : accepts a callback to be called when the component is unmounted

    ```jsx
    import { createComponent, reactive, onMounted, onUnmounted } from "@re-active/react";

    export const Timer = createComponent((props) => {
        let timer;

        const seconds = reactive(0);

        onMounted(() => {
            timer = setInterval(() => {
            seconds.value++;
            }, 1000);
        });

        onUnmounted(() => {
            clearInterval(timer);
        });

        return () => {
            const item = props.data;
            return <Example {...props}>{seconds.value} seconds passed</Example>;
        };
    });
    ```

    This lifecycle dependent logic can also be extracted and reused as follows

    ```jsx
    function timer(){
        let interval;

        const seconds = reactive(0);

        onMounted(() => {
            interval = setInterval(() => {
            seconds.value++;
            }, 1000);
        });

        onUnmounted(() => {
            clearInterval(interval);
        });

        return seconds;
    }

    export const Lifecycle = createComponent(() => {
        const seconds = timer();

        return () => (
            return <div>{seconds.value} seconds passed</div>;
        );
    });
    ```

- **imperativeHandle**: used set a ref
- **createComponent.withHandle**: used to create component with a forwarded ref

    ```jsx
    // works like React.forwardRef
    const Input = createComponent.withHandle((props, ref) => {

    // we can keep a reference to input element simple as this
    // React.createRef() can be used as well;
    let input;

    imperativeHandle(ref, {
        focus() {
        input.focus();
        }
    });

    return () => <input ref={r => input = r} />;
    });
    ```

## Context Api

Most of the time, shared reactive object will solve the problem of shared state and prop drilling  but there is still need for context api if you want to share data in a hierarchycal tree structure.

This is the same React context api. We use the useContext from @re-active/react package. Make sure Context.Provider value is reactive.

```jsx
import { createComponent, reactive, useContext } from "@re-active/react";

const Context = React.createContext();

const Label = createComponent((props) => {
  const context = useContext(Context);
  return () => <label>{context.text}</label>;
});

export const Component = createComponent((props) => {
  const contextValue = reactive({ text: "" });

  return () => (
    <div>
      <input
        value={contextValue.text}
        onChange={(e) => (contextValue.text = e.target.value)}
      />
      <Context.Provider value={contextValue}>
        <Label />
        <Label />
      </Context.Provider>
    </div>
  );
});
```
