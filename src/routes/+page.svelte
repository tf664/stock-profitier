<script lang="ts">
	import { BarChart, NewDataEntry } from '$lib';
	import { addBuy, getAllBuys } from '$lib/database/db';
	import { Capacitor } from '@capacitor/core';
	import '../components.css';

	import DebugMode from './debug/DebugMode.svelte';
	let debugModeComponent: DebugMode | undefined = undefined;

	import PortfolioPieChart from '$lib/components/ui/charts/PortfolioPieChart.svelte';
	import MonthlyVolumeChart from '$lib/components/ui/charts/MonthlyVolumeChart.svelte';
	import OpenPositionsChart from '$lib/components/ui/charts/OpenPositionsChart.svelte';

	let showDataEntry = $state(false);
	let result = $state('');
</script>

<main>
	<div id="top"></div>
	<div class="main-banner">
		<div style="margin: 2rem">
			<button onclick={() => (showDataEntry = !showDataEntry)} class="btn-standard">
				Enter new stock
			</button>

			{#if showDataEntry}
				<NewDataEntry onClose={() => (showDataEntry = false)} />
			{/if}
		</div>

		<div>
			<div class="title-wrapper">
				<button
					type="button"
					class="select-none settings-title"
					onclick={() => debugModeComponent?.handleTitleTap()}
					aria-label="Activate Debug Mode"
				>
					Text um Debug Mode zu aktivieren
				</button>
			</div>
			<DebugMode bind:this={debugModeComponent} />
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
