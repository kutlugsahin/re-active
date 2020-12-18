import { computed, ReadonlyComputed } from '@re-active/core';
import { Store } from '@re-active/hub';
import { createComponent, useComputed, useContext } from '@re-active/react';
import React from 'react';

export interface ProviderProps {
    store: Store;
    children: React.ReactNode;
}

const Context = React.createContext<Store>(null!);


export const Provider = createComponent((props: ProviderProps) => {
    return () => {
        return (
            <Context.Provider value={props.store}>
                {props.children}
            </Context.Provider>
        )
    }
})

export type Selector = <T, R>(state: T) => R;

export const selector = <T extends Selector>(sel: T): ReadonlyComputed<ReturnType<T>> => {
    const ctx = useContext(Context);

    return computed(() => {
        return sel(ctx.value.getState());
    }) as ReadonlyComputed<ReturnType<T>>;
}

export const useSelector = <T extends Selector>(sel: T): ReadonlyComputed<ReturnType<T>> => {
    const ctx = React.useContext(Context);

    return useComputed(() => {
        return sel(ctx.getState());
    }) as ReadonlyComputed<ReturnType<T>>;
}

export const dispatcher = () => {
    const ctx = useContext(Context);
    return ctx.value.dispatch;
}

export const useDispatch = () => {
    const ctx = React.useContext(Context);
    return ctx.dispatch;
}