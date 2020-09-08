import React from 'react';
import ReactDom from 'react-dom';
import { App } from './src/todo-app/App';
import { App as Browser } from './src/browsing-mobx';
import Example from './src/examples';
ReactDom.render(React.createElement(Browser), document.getElementById('app'));

