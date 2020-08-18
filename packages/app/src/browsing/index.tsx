import React from 'react';
import { Tree } from './components/tree';
import { createComponent } from '@re-active/react';
import './styles.css';
import { values, actions } from './store';
import { Item, Node } from './store/utils';
import { Main } from './components/main';
import { Details } from './components/details';

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
                        onSelected={(node) => {
                            actions.selectTreeNode(node).then(() => {
                                console.log('concluded:')
                            })
                        }}
                        renderNode={renderNode}
                        onExpanded={actions.expandTreeNode}
                    />
                </div>
                <div className="mainpanel">
                    <Main/>
                </div>
                <div className="detailpanel">
                    <Details />
                </div>
            </div>
        </div>
    );    
})