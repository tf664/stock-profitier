<script lang="ts">
	import { BarChart, NewDataEntry } from '$lib';
	import '../components.css';

	import DebugMode from './debug/DebugMode.svelte';
	let debugModeComponent: DebugMode | undefined = undefined;

	import PortfolioPieChart from '$lib/components/charts/PortfolioPieChart.svelte';
	import MonthlyVolumeChart from '$lib/components/charts/MonthlyVolumeChart.svelte';
	import OpenPositionsChart from '$lib/components/charts/OpenPositionsChart.svelte';

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
			<div class="z-1 title-wrapper">
				<button
					type="button"
					class="select-none settings-title"
					onclick={() => debugModeComponent?.handleTitleTap()}
					aria-label="Activate Debug Mode"
				>
					Debug Mode
				</button>
			</div>
			<DebugMode bind:this={debugModeComponent} />
		</div>

		<h3 class="font-semibold text-lg text-(--secondary)">Graphes</h3>

		<div class="flex flex-col gap-4 p-4">
			<PortfolioPieChart />
			<MonthlyVolumeChart />
			<OpenPositionsChart />
		</div>
	</div>
</main>
