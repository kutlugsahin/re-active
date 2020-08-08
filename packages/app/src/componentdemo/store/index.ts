import { createStore, createSelectors, createActions, watchStore } from '@re-active/store';
import { Dictionary, Item, Node, fetchItems, nodes, makeItem, makeTreeNode } from './utils';

interface Store {
    items: Dictionary<Item>;
    tree: Node<Item>[];
    selectedTreeNode: Node<Item> | null
}

createStore<Store>({
    items: {},
    tree: nodes,
    selectedTreeNode: null,
})

export const values = createSelectors({
    tree(state: Store) {
        return state.tree
    }
});

export const actions = createActions({
    selectTreeNode(state: Store, node: Node) {
        state.selectedTreeNode = node;
    },
    async expandTreeNode(state: Store, node: Node) {
        node.expanded = !node.expanded;

        if (node.children.length === 0) {
            node.loading = true;
            const newItems = await fetchItems(node);
            newItems.forEach(p => state.items[p.id] = p);
            node.children = newItems.map(makeTreeNode);
            node.loading = false;
        }
    }
});

watchStore((state: Store) => state.selectedTreeNode, (newNode, oldNode) => {
    if (oldNode) oldNode.selected = false;
    if (newNode) newNode.selected = true;
})