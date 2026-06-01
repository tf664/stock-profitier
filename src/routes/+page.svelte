<script lang="ts">
	import { BarChart, NewDataEntry } from '$lib';
	import { addBuy, getAllBuys } from '$lib/database/db';
	import { Capacitor } from '@capacitor/core';

	import PortfolioPieChart from '$lib/components/ui/charts/PortfolioPieChart.svelte';
	import MonthlyVolumeChart from '$lib/components/ui/charts/MonthlyVolumeChart.svelte';
	import OpenPositionsChart from '$lib/components/ui/charts/OpenPositionsChart.svelte';

	let showDataEntry = $state(false);
	let result = $state('');
</script>

<main>
	<div id="top"></div>
	<div class="main-banner">
		<div style="margin: 2rem;">
			<button onclick={() => (showDataEntry = !showDataEntry)} class="btn-standard">
				Enter new stock
			</button>

			{#if showDataEntry}
				<NewDataEntry onClose={() => (showDataEntry = false)} />
			{/if}
		</div>

		<!-- DEBUG – kann später entfernt werden -->
		<div>
			<h2>Database Debug</h2>
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
		</div>

		<h3>Graphes</h3>
		<!-- <div id="barchart" style="margin: 0.5rem;">
			<BarChart />
		</div> -->

		<div class="flex flex-col gap-4 p-4">
			<PortfolioPieChart />
			<MonthlyVolumeChart />
			<OpenPositionsChart />
		</div>
	</div>
</main>
