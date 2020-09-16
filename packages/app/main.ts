import React from 'react';
import ReactDom from 'react-dom';
import { App } from './src/todo-app/App';
import { App as Browser } from './src/browsing';
import Example from './src/examples';
import { renderStatic } from "@re-active/react";

ReactDom.render(React.createElement(Browser), document.getElementById('app'));

