import { useMemo } from 'react';
import { reactive, readonly } from '@re-active/core';
import { Computed, ComputedGetterSetter, ReadonlyComputed, computed } from '@re-active/core';
import { effect, watch } from './shared';

export const useReactive = <T>(val: T) => useMemo(() => reactive<T>(val), []);
export const useBox = <T>(val: T) => useMemo(() => reactive.box<T>(val), []);
export const useShallowBox = <T>(val: T) => useMemo(() => reactive.shallowBox<T>(val), []);
export const useShallow = <T>(val: T) => useMemo(() => reactive.shallow<T>(val), []);
export const useReadonly = <T>(val: T) => useMemo(() => readonly<T>(val), []);

export function useComputed<T>(getterSetter: ComputedGetterSetter<T>): Computed<T>;
export function useComputed<T>(getter: () => T): ReadonlyComputed<T>;
export function useComputed(getterSetter: any): any {
    return useMemo(() => computed(getterSetter), []);
}

export const useWatch: typeof watch = (...p: Parameters<typeof watch>) => useMemo(() => watch(...p), []);
export const useReactiveEffect: typeof effect = (...p: Parameters<typeof effect>) => useMemo(() => effect(...p), []);
