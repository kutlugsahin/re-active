import { Box, reactive, readonly, untracked } from '@re-active/core';
import { useEffect, useMemo, useRef } from 'react';

export interface ReactiveConfig {
    readonlyProps: boolean;
}

export type ReactiveProps<P extends { [key: string]: any }> = { [key in keyof P]: P[key] | Box<P[key]> }

let _config: ReactiveConfig = {
    readonlyProps: false,
};

export function config(cfg: ReactiveConfig) {
    Object.assign(_config, cfg);
}

export const useReactiveProps = <P extends { [key: string]: any }>(props: P) => {

    return untracked(() => {
        // convert props to a reactive object
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const { current: reactiveProps } = useRef(reactive({ ...props }));
        // keep the old props object for future comparison
        const prevProps = useRef<P>(props);

        // update the reactive props when the component is forced to render
        useEffect(() => {
            const prev = prevProps.current;

            for (const key in props) {
                if (prev[key] !== props[key]) {
                    (reactiveProps[key] as any) = props[key];
                }
            }

            for (const key in reactiveProps) {
                if (key in props === false) {
                    reactiveProps[key] = undefined!;
                }
            }

            prevProps.current = props;
        });

        if (_config.readonlyProps) {
            return useMemo(() => readonly(reactiveProps), []);
        }

        // now we return a reactive props object which will also react to parent renders
        return reactiveProps;
    })
}