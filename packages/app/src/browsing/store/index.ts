import { ActionGenerator, createActions, createSelectors, setStoreState, watchStore } from '@re-active/store';
import { Dictionary, fetchItems, Item, makeTreeNode, Node, nodes, RowItem } from './utils';

interface Store {
    items: Dictionary<Item>;
    tree: Node<Item>[];
    selectedTreeNode: Node<Item> | null;
    table: {
        loading: boolean;
        rows: RowItem[];
        selectedRow: RowItem | null;
    };
}

setStoreState<Store>({
    items: nodes.reduce((acc: Dictionary<Item>, node) => {
        acc[node.id] = node.data;

        node.children.forEach(p => {
            acc[p.id] = p.data
        });

        return acc;
    }, {}),
    tree: nodes,
    selectedTreeNode: null,
    table: {
        loading: false,
        rows: [],
        selectedRow: null,
    }
});

// watchActions(async (actionName, params, result) => {
//     console.log(`action ${actionName} is called`);

//     console.log(`${actionName} returned: ${await result}`);
// })

// ================ SELECTORS ===========================
export const values = createSelectors({
    tree(state: Store) {
        return state.tree
    },
    selectedTreeNode(state) {
        return state.selectedTreeNode;
    },
    tableState(state) {
        return state.table;
    },
    editingItem(state) {
        return state.table.selectedRow?.data || state.selectedTreeNode?.data;
    }
});
// ================ ACTIONS ===========================

export const actions = createActions({
    *loadChildren(state: Store, node: Node): ActionGenerator<Item[]> {
        if (node.children.length === 0 && node.loading === false) {
            try {
                node.loading = true;
                const newItems: Item[] = yield fetchItems(node);
                newItems.forEach(p => state.items[p.id] = p);
                node.children = newItems.map(p => makeTreeNode(p, node));
                return newItems;
            } finally {
                node.loading = false;
            }
        }
    },
    *selectTreeNode(state: Store, node: Node): ActionGenerator {
        if (node.selected === false) {
            try {
                state.selectedTreeNode = node;
                state.table.loading = true;
                yield actions.loadChildren(node);
                state.table.selectedRow = null;
                state.table.rows = state.selectedTreeNode.children.map(p => ({ selected: false, data: p.data }))
            } finally {
                state.table.loading = false;
            }
        }
    },
    async expandTreeNode(state: Store, node: Node): Promise<Item[]> {
        node.expanded = !node.expanded;
        return await actions.loadChildren(node);
    },
    selectTableItem(state: Store, item: RowItem) {
        state.table.selectedRow = item;
    },
    async browseTableItem(state: Store, item: RowItem) {
        state.selectedTreeNode.expanded = true;
        const treeNode = state.selectedTreeNode.children.find(p => p.id === item.data.id);
        await actions.selectTreeNode(treeNode);
    },
    async browseCurrentTableItem(state) {
        const selectedItem = state.table.selectedRow;
        if (selectedItem) {
            actions.browseTableItem(selectedItem);
        }
    },
    gotoParentFolder() {
        const currentTreeNode = values.selectedTreeNode;
        if (currentTreeNode && currentTreeNode.parent) {
            actions.selectTreeNode(currentTreeNode.parent);
        }
    },
    updateItem(state: Store, id: string, path: string, value: any) {
        state.items[id][path] = value;
    },
    resetState() {
        setStoreState({
            items: nodes.slice(0, 10).reduce((acc: Dictionary<Item>, node) => {
                acc[node.id] = node.data;

                node.children.forEach(p => {
                    acc[p.id] = p.data
                });

                return acc;
            }, {}),
            tree: nodes.slice(0, 10),
            selectedTreeNode: null,
            table: {
                loading: false,
                rows: [],
                selectedRow: null,
            }
        })
    }
});

// ================ WATCHERS ===========================
watchStore((state: Store) => state.selectedTreeNode, (newNode, oldNode) => {
    if (oldNode) oldNode.selected = false;
    if (newNode) newNode.selected = true;
})

watchStore((state: Store) => state.table.selectedRow, (newItem, oldItem) => {
    if (oldItem) oldItem.selected = false;
    if (newItem) newItem.selected = true;
})