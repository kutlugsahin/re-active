import React from 'react';
import ReactDom from 'react-dom';
import { App } from './src/todo-app/App';
import { App as Browser } from './src/browsing';
import Example from './src/examples';
ReactDom.render(React.createElement(App), document.getElementById('app'));

