import React from 'react';
import { Item } from '../store/utils';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedTableItemId, selectSelectedTreeNodeId } from '../store/selectors';
import { Store } from '../store';
import { updateItem } from '../store/actions';

export const Details = () => {

    const selectedTableId = useSelector(selectSelectedTableItemId);
    const selectedTreeId = useSelector(selectSelectedTreeNodeId);

    const item = useSelector((state: Store) => {
        if (selectedTableId) {
            return state.items[selectedTableId].data;
        }

        if (selectedTreeId) {
            return state.items[selectedTreeId].data;
        }

        return null;
    })

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


interface FieldProps {
    label: string;
    item: Item;
    path: string
}

export const Field = (props: FieldProps) => {
    const dispatch = useDispatch();
    return (
        <div className="field">
            <label className="label" htmlFor="">{props.label}</label>
            <div>
                <input className="input" type="text" value={props.item[props.path]} onChange={e => {
                    dispatch(updateItem(props.item.id, props.path, e.target.value));
                }} />
            </div>
        </div>
    )

}