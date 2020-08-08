import React from 'react';
import { createComponent } from '@re-active/react';

export interface Node<T = any> {
    data: T;
    id: string;
    children?: Node<T>[];
    selected: boolean;
    expanded: boolean;
    loading: boolean;
}

export interface TreeProps<T> {
    nodes: Node<T>[];
    onExpanded: (node: Node<T>) => void;
    onSelected: (node: Node<T>) => void;
    renderNode: (node: Node<T>) => JSX.Element;
}

export const Tree = createComponent((props: TreeProps<any>) => {
    return () => {
        console.log(`tree render`);
        return (
            <div>
                {props.nodes.map(p =>
                    <TreeNode
                        key={p.id}
                        node={p}
                        level={0}
                        onClick={props.onSelected}
                        renderNode={props.renderNode}
                        onExpand={props.onExpanded}
                    />)}
            </div>
        );
    }
});

interface TreeNodeProps<T = any> {
    node: Node<T>;
    level: number;
    onClick: (node: Node<T>) => void;
    onExpand: (node: Node<T>) => void;
    renderNode: (node: Node<T>) => JSX.Element;
}

export const TreeNode = createComponent((props: TreeNodeProps) => {
    function onClick() {
        props.onClick(props.node);
    }

    function onNodeExpand(e: React.MouseEvent) {
        e.stopPropagation();
        props.onExpand(props.node);
    }

    function drawStateIndicator({ loading, expanded, children }: Node) {
        if (loading) {
            return <Loading />
        }

        if (children) {
            return <span onClick={onNodeExpand} className={expanded ? 'caret expanded' : 'caret'}>▶</span>
        }

        return <span className="caret" />;
    }

    return () => {
        console.log(`tree node render: ${props.node.id}`);

        const { renderNode, node, level } = props;
        const { selected, expanded, children } = props.node;

        return (
            <div style={{ marginLeft: '15px' }}>
                <div className={selected ? 'node selected' : 'node'} onClick={onClick} onDoubleClick={onNodeExpand}>
                    {drawStateIndicator(node)}
                    {renderNode(node)}
                </div>
                <div style={{ display: expanded ? 'block' : 'none' }}>
                    {children?.map(p => {
                        return (
                            <TreeNode
                                {...props}
                                key={p.id}
                                node={p}
                                level={props.level + 1}
                            />
                        )
                    })}
                </div>
            </div>
        )
    }
});


export const Loading = () => {
    return <span className="loading">◠</span>
}

