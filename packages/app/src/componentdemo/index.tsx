import React from 'react';
import { Tree, Node } from './components';
import { createComponent } from '@re-active/react';
import './styles.css';
import { values, actions } from './store';
import { Item } from './store/utils';


export const App = createComponent(() => {

    function renderNode(node: Node<Item>) {
        return <span>{node.data.name}</span>
    }

    return () => (
        <div className="app">
            <div className="header"></div>
            <div className="main">
                <div className="treepanel">
                    <Tree
                        nodes={values.tree}
                        onSelected={actions.selectTreeNode}
                        renderNode={renderNode}
                        onExpanded={actions.expandTreeNode}
                    />
                </div>
            </div>
        </div>
    );    
})