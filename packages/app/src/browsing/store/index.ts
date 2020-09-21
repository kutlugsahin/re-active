import { createStore, Store, watchStore } from '@re-active/store';
import { Dictionary, fetchItems, Item, makeTreeNode, Node, nodes, RowItem } from './utils';

const storeDefinition = {
    state: {
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
    },
    actions: {
        *loadChildren({state}: TStore, node: Node) {
            try {
                if (node.children.length === 0) {
                    node.loading = true;
                    const newItems: Item[] = yield fetchItems(node);
                    newItems.forEach(p => state.items[p.id] = p);
                    node.children = newItems.map(p => makeTreeNode(p, node));
                    return newItems;
                }
            } finally {
                node.loading = false;
            }
        },
        *selectTreeNode({state}: TStore, node: Node) {
            try {
                state.selectedTreeNode = node;
                state.table.loading = true;
                yield* actionMap.loadChildren(state, node);

                state.table.selectedRow = null;
                state.table.rows = state.selectedTreeNode.children.map(p => ({ selected: false, data: p.data }))
            } finally {
                state.table.loading = false;
            }
        },
        async expandTreeNode({state}: TStore, node: Node) {
            node.expanded = !node.expanded;
            return await actions.loadChildren(node);
        },
        selectTableItem({state}: TStore, item: RowItem) {
            state.table.selectedRow = item;
        },
        async browseTableItem({state}: TStore, item: RowItem) {
            state.selectedTreeNode.expanded = true;
            const treeNode = state.selectedTreeNode.children.find(p => p.id === item.data.id);
            actions.selectTreeNode(treeNode);
        },
        async browseCurrentTableItem({state}) {
            const selectedItem = state.table.selectedRow;
            if (selectedItem) {
                actions.browseTableItem(selectedItem);
            }
        },
        gotoParentFolder({ state }: TStore) {
            const currentTreeNode = values.selectedTreeNode;
            if (currentTreeNode && currentTreeNode.parent) {
                actions.selectTreeNode(currentTreeNode.parent);
            }
        },
        updateItem(state: TStore, id: string, path: string, value: any) {
            state.items[id][path] = value;
        },
    },
    selectors: {
        tree({ state }) {
            return state.tree
        },
        selectedTreeNode({ state }) {
            return state.selectedTreeNode;
        },
        tableState({ state }) {
            return state.table;
        },
        editingItem({ state }) {
            return state.table.selectedRow?.data || state.selectedTreeNode?.data;
        }
    }
}

export const store = createStore(storeDefinition);

// ================ WATCHERS ===========================
watchStore((state: Store) => state.selectedTreeNode, (newNode, oldNode) => {
    if (oldNode) oldNode.selected = false;
    if (newNode) newNode.selected = true;
})

watchStore((state: Store) => state.table.selectedRow, (newItem, oldItem) => {
    if (oldItem) oldItem.selected = false;
    if (newItem) newItem.selected = true;
})