import React from 'react';
import ReactDom from 'react-dom';
import { App } from './src/demo/App';
import { List } from './src/vue-reactivity';
import { App as Browser } from './src/browsing';
ReactDom.render(React.createElement(Browser), document.getElementById('app'));

