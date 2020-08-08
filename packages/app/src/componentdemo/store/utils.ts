export function makeItem(id: string) {
    return {
        id,
        name: `item ${id}`,
        col1: `item ${id} columns 1`,
        col2: `item ${id} columns 2`,
        col3: `item ${id} columns 3`,
        col4: `item ${id} columns 4`,
    }
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const nodes: Node<Item>[] = Array(10).fill(null).map((_, i) => {
    const node: Node<Item> = {
        id: `${i}`,
        data: makeItem(`${i}`),
        expanded: false,
        loading: false,
        selected: false,
        children: Array(randomIntFromInterval(5, 30)).fill(null).map((_, j) => {
            return {
                data: makeItem(`${i}-${j}`),
                expanded: false,
                id: `${i}-${j}`,
                loading: false,
                selected: false,
                children: [],
            }
        })
    };

    return node;
})

export type Dictionary<T> = { [key: string]: T };
export type Node<T = any> = {
    id: string;
    data: T;
    children?: Node<T>[];
    loading: boolean;
    expanded: boolean;
    selected: boolean;
}

export interface Item {
    id: string;
    name: string;
    col1: string;
    col2: string;
    col3: string;
    col4: string;
}

export async function fetchItems(node: Node<Item>) {
    return new Promise<Item[]>(res => {
        setTimeout(() => {
            res(Array(randomIntFromInterval(5,30)).fill(null).map((_, i) => {
                return makeItem(`${node.id}-${i}`);
            }));
        }, 500);
    })
}

export function makeTreeNode(item: Item): Node<Item> {
    return {
        data: item,
        expanded: false,
        id: item.id,
        loading: false,
        selected: false,
        children: [],
    }
}

export interface RowItem {
    selected: boolean;
    data: Item
}