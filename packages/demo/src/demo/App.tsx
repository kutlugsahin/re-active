import { createComponent, onMounted } from '@re-active/react';
import React from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { List } from './components/List';
import { actions } from './store';
import './styles.css';

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