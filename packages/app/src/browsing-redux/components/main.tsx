import { createComponent } from '@re-active/react';
import React, { useDebugValue } from 'react';
import { RowItem, Item } from '../store/utils';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedTreeNodeId, selectLoadingTreeIds, selectTableRows, selectSelectedTableItemId } from '../store/selectors';
import { gotoParentFolder, browseCurrentTableItem, selectTableItem } from '../store/actions';

export const Main = () => {
    const dispatch = useDispatch();

    return (
        <div className="maincontainer">
            <div className="actions">
                <button onClick={()=> dispatch(gotoParentFolder())}>←</button>
                <button onClick={()=> dispatch(browseCurrentTableItem())}>↴</button>
            </div>
            <Table />
        </div>
    )
}

export const Table = React.memo(() => {
    const dispatch = useDispatch();

    const selectedTreeId = useSelector(selectSelectedTreeNodeId);
    const loadingIds = useSelector(selectLoadingTreeIds);
    const loading = loadingIds[selectedTreeId];
    const rows = useSelector(selectTableRows);

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.keyCode === 8) {
            dispatch(gotoParentFolder())
        }
    }

    if (!rows || loading) {
        return null;
    }

    return (
        <div className="tablecontainer" onKeyDown={onKeyDown} tabIndex={-1}>
            <table className={loading ? 'table loading' : 'table'}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Col1</th>
                        <th>Col2</th>
                        <th>Col3</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(p => <Row key={p.data.id} item={p.data} />)}
                </tbody>
            </table>
        </div>
    )

});

interface RowProps {
    item: Item;
}

export const Row = (props: RowProps) => {
    const dispatch = useDispatch();
    const selected = useSelector(selectSelectedTableItemId) === props.item.id;

    const { name, id, col1, col2, col3 } = props.item;
    return (
        <tr
            className={selected ? 'selected' : ''}
            onClick={() => dispatch(selectTableItem(props.item.id))}
            onDoubleClick={() => {
                dispatch(browseCurrentTableItem(props.item.id))
            }}
        >
            <td>{id}</td>
            <td>{name}</td>
            <td>{col1}</td>
            <td>{col2}</td>
            <td>{col3}</td>
        </tr>
    )

};