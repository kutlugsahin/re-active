import { reactive, watch } from '@re-active/core';
import { createComponent } from "@re-active/react";
import { shallow } from 'enzyme';
import React from 'react'


const Comp = createComponent(() => {


	return () => (
		<div>
			<button></button>
		</div>
	)
})

test('sdfsdf', done => {
	
	const cmp = shallow(<Comp />);
	
	const buttons = cmp.find('button');

	expect(buttons.length).toBe(1);

	done()

})