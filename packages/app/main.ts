import React from 'react';
import ReactDom from 'react-dom';
import { App } from './src/demo/App';
import { List } from './src/vue-reactivity';
import { App as Componentdemo } from './src/componentdemo';
ReactDom.render(React.createElement(Componentdemo), document.getElementById('app'));

