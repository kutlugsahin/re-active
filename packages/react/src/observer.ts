import { Computed, computed, coreEffect, reactive } from '@re-active/core';
import { FC, useRef, createElement, memo, PropsWithChildren, useState, useEffect, useMemo, ForwardRefExoticComponent, forwardRef, Ref, ForwardRefRenderFunction, useCallback } from 'react';
import { tickScheduler } from './schedulers';

interface ComponentState<P> {
	computedRender: Computed<React.ReactElement<any, any> | null>;
	props: P
}

export const observer = <P, H>(component: ForwardRefRenderFunction<H, P>) => {

	return memo(forwardRef((props: PropsWithChildren<P>, ref: Ref<H>) => {
		const [_, setState] = useState({});
		const willInvalidate = useRef(false);
		const componentState = useRef<ComponentState<P> | null>(null);



		if (!componentState.current) {
			const computedRender = computed(() => {
				const componentProps = componentState.current?.props || props;
				return component(componentProps, ref)
			});

			coreEffect(() => {
				if (componentState.current) {
					willInvalidate.current = true;
					setState({});
				}
				return computedRender.value;
			}, {
				scheduler: tickScheduler()
			})

			componentState.current = {
				computedRender,
				props,
			}
		} else {
			componentState.current.props = props;

			if (!willInvalidate.current) {
				return component(props, ref);
			} else {
				willInvalidate.current = false;
			}
		}

		return componentState.current.computedRender.value
	}))
}