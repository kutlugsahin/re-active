import React from 'react';
import { createComponent } from '@re-active/react';
import { values } from '../store';
import { Item } from '../store/utils';

export const Details = createComponent(() => {
    return () => {
        const item = values.editingItem;

        if (!item) {
            return <p>Select an item</p>;
        }

        return (
            <div>
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
                    <input className="input" type="text" value={props.item[props.path]} onChange={e => {
                        props.item[props.path] = e.target.value;
                    }} />
                </div>
            </div>
        )
    }
})