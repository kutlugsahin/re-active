import React from 'react';
import ReactDom from 'react-dom';
import { App as Browser } from './src/browsing';
import { App as BrowserRedux } from './src/browsing-redux';
ReactDom.render(React.createElement(BrowserRedux), document.getElementById('app'));

