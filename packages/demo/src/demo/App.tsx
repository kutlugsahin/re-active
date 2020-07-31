import React from 'react';
import { createComponent, onMounted } from 're-active';
import './styles.css';
import { Header } from './components/Header';
import { List } from './components/List';
import { Footer } from './components/Footer';
import { actions } from './store';

export const App = createComponent(() => {
	onMounted(() => {
		actions.populateStore();
	})

	return () => (
		<section className="todoapp">
			<div>
				<Header />
				<List />
				<Footer/>
			</div>
		</section>
	)
})

// export const App = createComponent(() => {
// 	return () => (
// 		<Loader>
// 			<Content/>
// 		</Loader>
// 	)
// })