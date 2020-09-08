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

		// first time setup computed render and effect
		if (!componentState.current) {
			const computedRender = computed(() => {
				const componentProps = componentState.current?.props || props;
				return component(componentProps, ref)
			});

			coreEffect(() => {
				if (componentState.current) {
					// reactive deoendency changed set flag
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
			// update prop ref to be used in the computed function
			componentState.current.props = props;

			// skip component render since reactive dep update. 
			if (!willInvalidate.current) {
				// update not because reacive prop change so render component directly
				return component(props, ref);
			} else {
				willInvalidate.current = false;
			}
		}

		// reactive dept has changed, willInvalidate was true -> computed function will run
		return componentState.current.computedRender.value;
	}))
}