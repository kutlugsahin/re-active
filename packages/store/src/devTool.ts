// import { ActionMiddleware, getGlobalStore } from './createStore';
// import { computed } from '@re-active/core';

// let extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
// let devTools: any;

// extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
// if (extension) {
//     devTools = extension.connect({
//         options: false,
//         shouldRecordChanges: false,
//         features: {
//             pause: false, // start/pause recording of dispatched actions
//             lock: false, // lock/unlock dispatching actions and side effects    
//             persist: false, // persist states on page reloading
//             export: false, // export history of actions in a file
//             import: 'custom', // import history of actions from a file
//             jump: false, // jump back and forth (time travelling)
//             skip: false, // skip (cancel) actions
//             reorder: false, // drag and drop actions in the history list 
//             dispatch: false, // dispatch custom actions or action creators
//             test: false // generate tests for the selected actions
//         },
//     });

//     setTimeout(() => {
//         devTools.init(getGlobalStore())
//     }, 1000);
// }

// export const reduxDevToolMiddleware: ActionMiddleware = async (action, params, name) => {
//     await action();
    
//     const state = getGlobalStore();
//     // devTools.send(null, JSON.stringify(state, getCircularReplacer()));
//     devTools.send({
//         type: name
//     }, { ...state }, {
//         serialize: {
//             options: false,
//         }
//     });
// }