import React from 'react';
import { createComponent, reactive } from '@re-active/react';
import { values, actions } from '../store';
import { Item } from '../store/utils';
import { Reactive } from '@re-active/core';

export const Details = createComponent(function Details() {
    return () => {
        let item = values.editingItem;

        if (!item) {
            return <p>Select an item</p>;
        }

        return (
            <div key={item.id}>
                <h3>{item.name}</h3>
                <Field item={item} label="name" path="name" />
                <Field item={item} label="Col1" path="col1" />
                <Field item={item} label="Col2" path="col2" />
                <Field item={item} label="Col3" path="col3" />
                <Field item={item} label="Col4" path="col4" />
            </div>
        );
    }
})


interface FieldProps {
    label: string;
    item: Item;
    path: string
}

export const Field = createComponent((props: FieldProps) => {
    return () => {
        return (
            <div className="field">
                <label className="label" htmlFor="">{props.label}</label>
                <div>
                    <input id={`input-${props.path}-${props.item.id}`} className="input" type="text" value={props.item[props.path]} onChange={e => {
                        actions.updateItem(props.item.id, props.path, e.target.value);
                    }} />
                </div>
            </div>
        )
    }
});

type Render<T> = (props: T) => JSX.Element;
type ReactiveC<R, T extends (render: Render<R>, setup: (props: any) => R) => void> = (render: R,) => {

}


type ReactComp<P, R> = (render: Render<R>, setup: (props: P) => R) => void;

const defineComponent = <P, R>(setup: (props: P) => R, render: Render<Reactive<R>>) => {

}



defineComponent(() => {

    const state = reactive({
        a: 3,
    });


    const clicks = reactive(3);

    return {
        ...state,
        clicks,
    }


}, ({ a, clicks }) => {

    return <div></div>
})


