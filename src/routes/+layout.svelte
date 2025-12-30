<script lang="ts">
	import './layout.css';
	import './custom.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { ModeWatcher } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import MoonStars from '@lucide/svelte/icons/moon';

	import { toggleMode } from 'mode-watcher';
	import { FileSliders } from '@lucide/svelte';

	import { initDB } from '$lib/database/db';

	let { children } = $props();

	let mobileMenuOpen = $state(false);

	async function scrollToSection(event: MouseEvent, id: string) {
		event.preventDefault();

		if ($page.url.pathname !== '/') {
			// Navigate to home page first
			await goto('/');
			// Wait a bit for navigation to complete
			setTimeout(() => {
				const element = document.getElementById(id);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
				}
			}, 100);
		} else {
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
		mobileMenuOpen = false;
	}

	onMount(async () => {
		await initDB();
		console.log('Database initialized');
	});
</script>

<svelte:head
	><link rel="icon" href={favicon} />
	<link rel="stylesheet" href="styles.css" />
</svelte:head>

<header
	class="top-0 z-50 sticky flex justify-between items-center bg-background/80 backdrop-blur-md px-4 md:px-6 border-foreground/10 border-b h-16"
>
	<div class="flex items-center">
		<a
			href="#top"
			onclick={(e) => scrollToSection(e, 'top')}
			class="font-heading font-medium text-foreground text-s hover:text-primary tracking-tight transition-colors"
		>
			<span class="font-bold; text-primary">&lt;</span>Stock Profitier<span class="text-primary"
				>/&gt;</span
			>
		</a>
	</div>
	<nav class="hidden md:flex items-center gap-12">
		<a
			href="/about"
			class="text-[10px] text-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-colors"
		>
			About</a
		>

		<a
			href="/settings"
			class="inline-flex items-center gap-1 text-[10px] text-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-colors"
		>
			Settings</a
		>
	</nav>
	<div class="flex items-center gap-3 md:gap-4">
		<button
			class="hidden sm:block font-heading text-[10px] text-foreground hover:text-primary uppercase tracking-[0.2em] transition-colors"
			>() =&gt;<!-- --> Enter new data</button
		>

		<button onclick={toggleMode} class="relative flex justify-center items-center">
			<Sun
				class="w-[1.2rem] h-[1.2rem] rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all duration-300 ease-in-out"
			/>
			<MoonStars
				class="absolute w-[1.2rem] h-[1.2rem] rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all duration-300 ease-in-out"
			/>
		</button>

		<button
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			class="md:hidden relative flex justify-center items-center"
			aria-label="Open menu"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4 6h16M4 12h16M4 18h16"
				></path></svg
			></button
		>
	</div>
</header>

{#if mobileMenuOpen}
	<div class="lg:hidden bg-background p-4 border-foreground/10 border-b">
		<nav class="flex flex-col gap-1">
			<a
				href="#barchart"
				onclick={() => (mobileMenuOpen = false)}
				class="inline-flex items-center gap-1 text-[10px] text-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-colors"
			>
				Barchart</a
			>
			<a
				href="/about"
				onclick={() => (mobileMenuOpen = false)}
				class="inline-flex items-center gap-1 text-[10px] text-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-colors"
			>
				About</a
			>
			<a
				href="/settings"
				class="inline-flex items-center gap-1 text-[10px] text-foreground/60 hover:text-primary uppercase tracking-[0.2em] transition-colors"
			>
				<FileSliders size={9} /> Settings</a
			>
		</nav>
	</div>
{/if}

<ModeWatcher />
<main>
	{@render children?.()}
</main>
