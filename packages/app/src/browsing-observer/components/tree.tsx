import { observer } from '@re-active/react';
import React, { useEffect } from 'react';
import { Node } from '../../browsing/store/utils';

// =============== TYPES ============================
export interface TreeProps<T> {
    nodes: Node<T>[];
    onExpanded: (node: Node<T>) => void;
    onSelected: (node: Node<T>) => void;
    renderNode: (node: Node<T>) => JSX.Element;
}

interface TreeNodeProps<T = any> {
    node: Node<T>;
    level: number;
    onClick: (node: Node<T>) => void;
    onExpand: (node: Node<T>) => void;
    renderNode: (node: Node<T>) => JSX.Element;
}
// =================================================

export const Tree = observer((props: TreeProps<any>) => {
    return (
        <div>
            {props.nodes.map(node =>
                <TreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    onClick={props.onSelected}
                    renderNode={props.renderNode}
                    onExpand={props.onExpanded}
                />)}
        </div>
    );
});

export const TreeNode = observer((props: TreeNodeProps) => {
    function onNodeExpand(e: React.MouseEvent) {
        e.stopPropagation();
        props.onExpand(props.node);
    }

    function drawStateIndicator({ loading, expanded, children }: Node) {
        if (loading) return <Loading />;
        if (children) return <span onClick={onNodeExpand} className={expanded ? 'caret expanded' : 'caret'}>▶</span>
        return <span className="caret" />;
    }

    function renderTreeNode(node: Node) {
        return (
            <TreeNode
                {...props}
                key={node.id}
                node={node}
                level={props.level + 1}
            />
        );
    }

    // useEffect(() => {
    //     console.log('tree node render ' + props.node.id);
    // })

    const { renderNode, node, onClick } = props;
    const { selected, expanded, children } = props.node;

    return (
        <div className="nodecontainer">
            <div
                id={`node-${node.id}`}
                className={selected ? 'node selected' : 'node'}
                onClick={() => onClick(node)}
                onDoubleClick={onNodeExpand}
            >
                {drawStateIndicator(node)}
                {renderNode(node)}
            </div>
            <div style={{ display: expanded ? 'block' : 'none' }}>
                {children?.map(renderTreeNode)}
            </div>
        </div>
    )
});

// export class TreeNode extends ObserverComponent<TreeNodeProps> {
//     onNodeExpand = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         this.props.onExpand(this.props.node);
//     }

//     drawStateIndicator = ({ loading, expanded, children }: Node) => {
//         if (loading) return <Loading />;
//         if (children) return <span onClick={this.onNodeExpand} className={expanded ? 'caret expanded' : 'caret'}>▶</span>
//         return <span className="caret" />;
//     }

//     renderTreeNode = (node: Node) => {
//         return (
//             <TreeNode
//                 {...this.props}
//                 key={node.id}
//                 node={node}
//                 level={this.props.level + 1}
//             />
//         );
//     }

//     render() {
//         const { renderNode, node, onClick } = this.props;
//         const { selected, expanded, children } = this.props.node;
//         return <div className="nodecontainer">
//             <div
//                 id={`node-${node.id}`}
//                 className={selected ? 'node selected' : 'node'}
//                 onClick={() => onClick(node)}
//                 onDoubleClick={this.onNodeExpand}
//             >
//                 {this.drawStateIndicator(node)}
//                 {renderNode(node)}
//             </div>
//             <div style={{ display: expanded ? 'block' : 'none' }}>
//                 {children?.map(this.renderTreeNode)}
//             </div>
//         </div>
//     }
// };


export const Loading = () => {
    return <span className="loadingindicator">◠</span>
}

