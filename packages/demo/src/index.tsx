import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './demo/App';
import './style.css';
import { List } from './vue-reactivity'; 
ReactDOM.render(
  // <React.StrictMode>
  // <VueApp />
  <List/>
  // <App/>
  // </React.StrictMode>
  ,document.getElementById('root')
);