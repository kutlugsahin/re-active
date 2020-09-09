import { Computed, computed, coreEffect, reactive } from '@re-active/core';
import { FC, useRef, createElement, memo, PropsWithChildren, useState, useEffect, useMemo, ForwardRefExoticComponent, forwardRef, Ref, ForwardRefRenderFunction, useCallback, ClassicComponent, PureComponent, ComponentType, ComponentClass, Component, ReactNode } from 'react';
import { tickScheduler } from './schedulers';

export type ObserverFunctionalComponent<P, H> = ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<H>>;

interface ComponentState<P> {
	computedRender: Computed<React.ReactElement<any, any> | null>;
	props: P
}

const observerFunction = <P, H>(component: ForwardRefRenderFunction<H, P>) => {

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
					// reactive dependency changed set flag
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
			}

			willInvalidate.current = false;
		}

		// reactive dept has changed, willInvalidate was true -> computed function will run
		return componentState.current.computedRender.value;
	}))
}

function bindObserverClass(instance: any, base: any) {
	let computedRender: Computed<ReactNode> | null = null;
	let mounted = false;
	let willInvalidate = false;

	const renderer = instance.render.bind(instance);
	const baseMount = instance.componentDidMount?.bind(instance);

	const baseRender = () => {
		if (!computedRender) {
			computedRender = computed(renderer);

			coreEffect(() => {
				willInvalidate = true;
				if (mounted) {
					instance.forceUpdate();
				}

				return computedRender?.value;
			}, {
				scheduler: tickScheduler()
			})
		}

		if (willInvalidate) {
			willInvalidate = false;
			return computedRender.value;
		} else {
			return renderer();
		}
	}

	instance.render = baseRender;

	instance.componentDidMount = () => {
		mounted = true;
		if (baseMount) {
			baseMount();
		}
	}
}

const observerClass = <P>(component: ComponentClass<P>): typeof component => {
	class ObserverClass extends component {
		private computedRender: Computed<any> | null;
		private mounted: boolean;
		private willInvalidate: boolean

		constructor(props: P, context?: any) {
			super(props, context);
			this.computedRender = null;
			this.mounted = false;
			this.willInvalidate = false;
		}

		componentDidMount() {
			this.mounted = true;
			if (super.componentDidMount) {
				super.componentDidMount();
			}
		}

		render() {
			if (!this.computedRender) {
				this.computedRender = computed(() => super.render());

				coreEffect(() => {
					this.willInvalidate = true;
					if (this.mounted) {
						this.forceUpdate();
					}

					return this.computedRender?.value;
				}, {
					scheduler: tickScheduler()
				})
			}

			if (this.willInvalidate) {
				this.willInvalidate = false;
				return this.computedRender.value;
			} else {
				return super.render();
			}
		}
	}

	if (component.prototype instanceof PureComponent) {
		return ObserverClass;
	}

	return memo(ObserverClass) as unknown as typeof component;
}

export function observer<P, T extends ComponentClass<P>>(component: T): T;
export function observer<P, H>(component: ForwardRefRenderFunction<H, P>): ObserverFunctionalComponent<P, H>;
export function observer(component: any): any {
	let resultingComponent;

	if (component.prototype instanceof Component) {
		resultingComponent = observerClass(component);
	} else {
		resultingComponent = observerFunction(component);
	}

	resultingComponent.displayName = component.displayName || component.nane || 'ObserverComponent';

	return resultingComponent;
}

export class ObserverComponent<P = {}, S = {}> extends PureComponent<P, S> {
	constructor(props: P) {
		super(props);
		bindObserverClass(this, this);
	}
}