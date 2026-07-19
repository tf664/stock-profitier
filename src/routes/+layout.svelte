<script lang="ts">
	import './layout.css';
	import './custom.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	import { initDB } from '$lib/database/db';
	import { Capacitor } from '@capacitor/core';

	import Header from '$lib/components/Header.svelte';

	let { children } = $props();

	onMount(async () => {
		if (Capacitor.isNativePlatform()) {
			await initDB();
			console.log('Database initialized');
		} else {
			console.log('Running in browser - SQLite not available');
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main>
	<Header />
	{@render children?.()}
</main>
