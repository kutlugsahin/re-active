import { useEffect, useState } from 'react';
import { reactive, readonly } from '@re-active/core';
import { Computed, ComputedGetterSetter, ReadonlyComputed, box } from '@re-active/core';
import { effect, watch } from './reactivity';

export const useReactive = <T>(val: T) => useState(() => reactive<T>(val))[0];
export const useBox = <T>(val: T) => useState(() => box<T>(val))[0];
export const useShallowBox = <T>(val: T) => useState(() => box.shallow<T>(val))[0];
export const useShallow = <T>(val: T) => useState(() => reactive.shallow<T>(val))[0];
export const useReadonly = <T>(val: T) => useState(() => readonly<T>(val))[0];
export const useShallowReadonly = (val: Object) => useState(() => readonly.shallow(val))[0];

export function useComputed<T>(getterSetter: ComputedGetterSetter<T>): Computed<T>;
export function useComputed<T>(getter: () => T): ReadonlyComputed<T>;
export function useComputed(getterSetter: any): any {
    const [computed]: any = useState(() => computed(getterSetter));

    useEffect(() => computed.dispose, []);
    
    return computed;
}

export const useWatch: (...p: Parameters<typeof watch>) => void = (...p: Parameters<typeof watch>) => {
    const [dispose] = useState(() => watch(...p));

    useEffect(() => dispose, []);

    return dispose;
};
export const useReactiveEffect: (...p: Parameters<typeof effect>) => void = (...p: Parameters<typeof effect>) => {
    const [dispose] = useState(() => effect(...p));

    useEffect(() => dispose, []);

    return dispose;
};