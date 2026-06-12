<script lang="ts">
	import { addBuy, getAllBuys } from '$lib/database/db';
	import { Capacitor, SystemBarType } from '@capacitor/core';

	const browser: boolean = typeof window !== 'undefined';

	let debugModeEnabled = $state(false);
	const REQUIRED_TAPS = 5;
	let tapCount = 0;
	let tapTimeout: ReturnType<typeof setTimeout>;
	const TAP_TIMEOUT = 3000; // Reset after 3 seconds of inactivity

	let query = $state('');

	let result = $state('');

	export function handleTitleTap() {
		console.log('Title tapped ' + tapCount + ' times');
		tapCount++;

		// Clear previous timeout
		if (tapTimeout) {
			clearTimeout(tapTimeout);
		}

		// Check if debug mode should be enabled
		if (tapCount >= REQUIRED_TAPS) {
			debugModeEnabled = !debugModeEnabled;
			tapCount = 0;

			// Persist in sessionStorage (survives page navigation but not app close)
			if (browser) {
				sessionStorage.setItem('morse-debug-mode', debugModeEnabled ? 'true' : 'false');
			}

			// Show feedback
			if (debugModeEnabled) {
				setTimeout(() => 2500);
			} else {
				setTimeout(() => 2500);
			}
		} else if (tapCount >= 2) {
			// Show countdown when 3 or fewer taps remain
			const remaining = REQUIRED_TAPS - tapCount;

			setTimeout(() => 1500);

			// Reset tap count after timeout
			tapTimeout = setTimeout(() => {
				tapCount = 0;
			}, TAP_TIMEOUT);
		} else {
			// Reset tap count after timeout (first tap, no toast)
			tapTimeout = setTimeout(() => {
				tapCount = 0;
			}, TAP_TIMEOUT);
		}
	}
</script>

{#if debugModeEnabled}
	<h2>Debug Panel</h2>
	<button
		onclick={async () => {
			if (!Capacitor.isNativePlatform()) {
				result = 'SQLite nur auf nativer Plattform';
				return;
			}
			await addBuy('AAPL', new Date(), 10, 150.0, 3.9, 'EUR', 'Test');
			result = 'Test-Kauf hinzugefügt';
		}}
		class="btn-cancel">Test-Kauf hinzufügen</button
	>

	<button
		onclick={async () => {
			if (!Capacitor.isNativePlatform()) {
				result = 'SQLite nur auf nativer Plattform';
				return;
			}
			const data = await getAllBuys();
			result = JSON.stringify(data, null, 2);
		}}
		class="btn-cancel">DB auslesen</button
	>

	<textarea readonly style="width: 100%; height: 200px; margin-top: 1rem;">{result}</textarea>

	<input
		bind:value={query}
		type="text"
		placeholder="SQL query"
		style="width: 100%; margin-top: 1rem"
	/>
	<button onclick={async () => {}} class="btn-cancel">Query ausführen</button>
{/if}
