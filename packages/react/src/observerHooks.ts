import { useEffect, useMemo } from 'react';
import { reactive, readonly } from '@re-active/core';
import { Computed, ComputedGetterSetter, ReadonlyComputed, box } from '@re-active/core';
import { effect, watch } from './reactivity';

export const useReactive = <T>(val: T) => useMemo(() => reactive<T>(val), []);
export const useBox = <T>(val: T) => useMemo(() => box<T>(val), []);
export const useShallowBox = <T>(val: T) => useMemo(() => box.shallow<T>(val), []);
export const useShallow = <T>(val: T) => useMemo(() => reactive.shallow<T>(val), []);
export const useReadonly = <T>(val: T) => useMemo(() => readonly<T>(val), []);

export function useComputed<T>(getterSetter: ComputedGetterSetter<T>): Computed<T>;
export function useComputed<T>(getter: () => T): ReadonlyComputed<T>;
export function useComputed(getterSetter: any): any {
    const computed: any = useMemo(() => computed(getterSetter), []);

    useEffect(() => {
        computed.dispose();
    }, []);
    
    return computed;
}

export const useWatch: (...p: Parameters<typeof watch>) => void = (...p: Parameters<typeof watch>) => {
    const dispose = useMemo(() => watch(...p), []);

    useEffect(() => dispose, []);
};
export const useReactiveEffect: (...p: Parameters<typeof effect>) => void = (...p: Parameters<typeof effect>) => {
    const dispose = useMemo(() => effect(...p), []);

    useEffect(() => dispose, []);
};
