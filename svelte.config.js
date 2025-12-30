import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// Use the static adapter for Capacitor
		adapter: adapter({
			pages: 'www',    // where static files will go
			assets: 'www',
			fallback: 'index.html'   // enables SPA mode
		}),
		// If you use dynamic routing, you may need fallback: 'index.html'
	},

	extensions: ['.svelte', '.svx']
};

export default config;