import { createStore, createSelectors, createActions, watchStore } from '@re-active/store';
import { Dictionary, Item, Node, fetchItems, nodes, makeTreeNode, RowItem } from './utils';

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

createStore<Store>({
    items: {},
    tree: nodes,
    selectedTreeNode: null,
    table: {
        loading: false,
        rows: [],
        selectedRow: null,
    }
})

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
    async loadChildren(state: Store, node: Node) {
        if (node.children.length === 0) {
            node.loading = true;
            const newItems = await fetchItems(node);
            newItems.forEach(p => state.items[p.id] = p);
            node.children = newItems.map(p => makeTreeNode(p, node));
            node.loading = false;
        }
    },
    async selectTreeNode(state: Store, node: Node) {
        state.selectedTreeNode = node;
        state.table.loading = true;
        await actions.loadChildren(node);        
        state.table.loading = false;
        state.table.selectedRow = null;
        state.table.rows = state.selectedTreeNode.children.map(p => ({ selected: false, data: p.data }))
    },
    async expandTreeNode(state: Store, node: Node) {
        node.expanded = !node.expanded;
        await actions.loadChildren(node);
    },
    selectTableItem(state: Store, item: RowItem) {
        state.table.selectedRow = item;
    },
    async browseTableItem(state: Store, item: RowItem) {
        state.selectedTreeNode.expanded = true;
        const treeNode = state.selectedTreeNode.children.find(p => p.id === item.data.id);
        actions.selectTreeNode(treeNode);
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