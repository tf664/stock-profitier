<script lang="ts">
	import { BarChart, NewDataEntry } from '$lib';

	let showDataEntry = $state(false);

	import { addTestTrade, getDBAllBuys } from '$lib/database/db'; // DEBUG
	import { Capacitor } from '@capacitor/core';
	let result = $state('test');
</script>

<!-- Page Content -->
<main>
	<div id="top"></div>
	<div class="main-banner">
		<div style="margin: 2rem;">
			<button onclick={() => (showDataEntry = !showDataEntry)} class="btn-standard"
				>Enter new stock</button
			>

			{#if showDataEntry}
				<NewDataEntry onClose={() => (showDataEntry = false)} />
			{/if}
		</div>

		<div>
			<!-- DEBUG -->
			<h2>Database Debug Test</h2>
			<button
				onclick={async () => {
					if (Capacitor.isNativePlatform()) {
						await addTestTrade();
					} else {
						console.log('SQLite only works on native platform');
					}
				}}
				class="btn-cancel">ADD TEST TRADE</button
			>

			<button
				onclick={async () => {
					if (Capacitor.isNativePlatform()) {
						const data = await getDBAllBuys();
						result = JSON.stringify(data, null, 2);
					} else {
						result = 'SQLite only works on native platform';
					}
				}}
				class="btn-cancel">Get DB</button
			>

			<textarea readonly id="debugTest" style="width: 100%; height: 200px; margin-top: 1rem;">{result}</textarea>
		</div>

		<h3>Graphes</h3>
		<div id="barchart" style="margin: 0.5rem;">
			<BarChart />
		</div>
	</div>
</main>
