import React from 'react';
import './styles.css';
import { LocalState } from './LocalState';
import { SharedState } from './SharedState';
import { Props } from './Props';
import { ReRender } from './ReRender';
import { Lifecycle } from './Lifecycle';
import { ImperativeHandle } from './ImperativeHandle';
import { ContextApi } from './ContextApi';
import { Watch } from './Watch';
import { Computed } from './Computed';
import { WatchOptions, WatchOptionsObserver } from './WatchOptions';
import { Reactivity } from './Reactivity';
import { WithReactComponents } from './WithReactComponents';
import { Interop } from './Interop';
import { ObserverComp, Counter, ObserverClassComp, ObserverClassComp2, Counter2, SimpleObserverFunction } from './Observer';
import { DependencySwitch } from './DependencySwitch';
import { Updates } from './Updates';

const Example = (props) => {
    return (
        <div className="example">
            <div>{props.title}</div>
            <div className="content">{props.children}</div>
        </div>
    );
};

export default () => {
    return (
        <div>
            <Example title="Local state">
                <LocalState />
            </Example>
            <Example title="Shared state">
                <SharedState />
            </Example>
            <Example title="Props">
                <Props />
            </Example>
            <Example title="What makes a reactive component to render?">
                <ReRender />
            </Example>
            <Example title="Lifecycles: onMounted / onUnmounted">
                <Lifecycle />
            </Example>
            <Example title="imperativeHandle and withHandle usage">
                <ImperativeHandle />
            </Example>
            <Example title="Context api">
                <ContextApi />
            </Example>
            <Example title="Watching a reactive value">
                <Watch />
            </Example>
            <Example title="computed usage">
                <Computed />
            </Example>
            <Example title="watch options">
                <WatchOptions />
                <WatchOptionsObserver/>
            </Example>
            <Example title="Reactivity">
                <Reactivity />
            </Example>
            <Example title="With React Components">
                <WithReactComponents />
            </Example>
            <Example title="Interoperability">
                <Interop />
            </Example>
            <Example title="make reactive">
                <ObserverClassComp2 />
                <ObserverClassComp />
                <SimpleObserverFunction/>
            </Example>
            <Example title="dependency switch">
                <DependencySwitch/>
            </Example>
            <Example title="updates">
                <Updates />
            </Example>
        </div>
    );
};
