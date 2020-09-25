import { isBox } from '@re-active/core';

describe('reactivity hacks', () => {
    it('isBox checks __v_isRef', () => {
        const computed = { '__v_isRef': true, value: 0 };

        expect(isBox(computed)).toBe(true);
    })
})