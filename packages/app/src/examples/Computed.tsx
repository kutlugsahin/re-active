import React from "react";
import { createComponent, reactive, computed } from "@re-active/react";

const state = reactive({
  amount: 0,
  price: 10,
  productName: "product1"
});

const totalPrice = computed(() => {
  console.log("total price is calculated");
  return state.amount * state.price + "$";
});

state.amount = 1;
console.log(totalPrice.value);

state.price = 20;
console.log(totalPrice.value);

state.amount = 1;
state.productName = '1';
console.log(totalPrice.value);

const PriceCalculator = createComponent(() => {
  const state = reactive({
    amount: 0,
    price: 10,
    clicks: 0,
  });

  const totalPrice = computed(() => {
    return state.amount * state.price + "$";
  });

  return () => (
    <div>
      <div>
        Price:{" "}
        <input
          type="number"
          value={state.price}
          onChange={(e) => (state.price = +e.target.value)}
        />
      </div>
      <div>
        Amount:{" "}
        <input
          type="number"
          value={state.amount}
          onChange={(e) => (state.amount = +e.target.value)}
        />
      </div>
      Total Price: {totalPrice.value}
      <button onClick={() => state.clicks++}>{state.clicks}</button>
    </div>
  );
});

export const Computed = () => <PriceCalculator />
