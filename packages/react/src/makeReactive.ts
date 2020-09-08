import { Computed, computed, coreEffect, reactive } from '@re-active/core';
import { FC, useRef, createElement, memo, PropsWithChildren, useState, useEffect, useMemo } from 'react';
import { tickScheduler } from './schedulers';

interface ComponentState {
	computedRender: Computed<React.ReactElement<any, any> | null>;
}

export const makeReactive = <P>(component: FC<P>) => {

	return memo((props: PropsWithChildren<P>) => {
		const [_, setState] = useState({});
		const willInvalidate = useRef(false);
		const componentState = useRef<ComponentState | null>(null);

		if (!componentState.current) {
			const computedRender = computed(() => component(props));

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
			}
		} else {
			if (!willInvalidate.current) {
				return component(props);
			} else {
				willInvalidate.current = false;
			}
		}

		return componentState.current.computedRender.value
	})
}