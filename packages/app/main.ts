import React from 'react';
import ReactDom from 'react-dom';
import { App } from './src/demo/App';
import { List } from './src/vue-reactivity';
import { App as Browser } from './src/browsing';
import Example from './src/examples';
ReactDom.render(React.createElement(Example), document.getElementById('app'));

