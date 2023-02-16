import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
	input: './index.js',
	output: {
		file: 'dist/app.cjs',
		format: 'cjs',
	},
	external: ['sqlite3'],
	mode: 'production',
	plugins: [
		nodeResolve({
			preferBuiltins: true
		}),
		json(),
		commonjs({
			transformMixedEsModules: true,
			ignoreDynamicRequires: true,
		}),
		terser({
			compress: true
		})
	],
};
