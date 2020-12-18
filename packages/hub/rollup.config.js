import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];

const name = 'ReactiveHub';

export default {
    input: './src/index.ts',

    external: ['@re-active/core'],

    plugins: [
        // Allows node_modules resolution
        resolve({ extensions }),

        // Allow bundling cjs modules. Rollup doesn't understand cjs
        commonjs(),

        // Compile TypeScript/JavaScript files
        babel({ extensions, include: ['src/**/*'], babelHelpers: 'bundled' }),
    ],

    output: [{
        file: pkg.main,
        format: 'cjs',
    }, {
        file: pkg.module,
        format: 'es',
    }, {
        file: pkg.umd,
        format: 'umd',
        name,

        // https://rollupjs.org/guide/en#output-globals-g-globals
        globals: {
            "@re-active/core": "ReactorCore",
        },
    }],
};