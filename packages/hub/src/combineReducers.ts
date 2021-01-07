import { Reducer } from './types';

export const combineReducers = (reducersMap: { [key: string]: Reducer }): Reducer => {
    
    let combinedState: any;

    return (state: any, action: any) => {
        if (combinedState == null) {
            combinedState = Object.keys(reducersMap).reduce((acc, key: string) => {
                acc[key] = reducersMap[key](state?.[key], action);
                return acc;
            }, {} as any);

        } else {
            Object.keys(reducersMap).forEach(key => {
                const result = reducersMap[key](state[key], action);

                if (result !== undefined) {
                    state[key] = result;
                }
            })
        }
        
        return combinedState;
    }
}