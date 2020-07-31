import React, { PropsWithChildren } from 'react';
import { createComponent, reactive, onMounted } from 're-active';

const load = () => {
	const isLoading = reactive(true);

	onMounted(() => {
		setTimeout(() => {
			isLoading.value = false;
		}, 1000)

		setTimeout(() => {
			isLoading.value = true;
		}, 2000)
		
		setTimeout(() => {
			isLoading.value = false;
		}, 3000)
	})

	return isLoading;
}

export const Loader = createComponent((props: PropsWithChildren<{}>) => {

	const isLoading = load();

	return () => {
		console.log('loader rendered')
		return isLoading.value ? <div>Loading...</div> : <div>{React.cloneElement(props.children as any, {isLoading})}</div>
	}
})

export const Content = createComponent((props: any) => {

	return () => {
		console.log('content rendered');
		return (
			<div>Content loaded ? </div>
		)
	}
});
