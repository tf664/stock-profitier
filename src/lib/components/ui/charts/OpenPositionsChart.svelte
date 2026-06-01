<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import { Card } from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { getOpenPositions } from '$lib/database/db';

	let options: ApexOptions = $state({
		series: [],
		chart: {
			type: 'bar',
			height: 320,
			fontFamily: 'Inter, sans-serif',
			toolbar: { show: false }
		},
		colors: ['#1A56DB'],
		plotOptions: {
			bar: {
				horizontal: true,
				borderRadius: 6,
				borderRadiusApplication: 'end'
			}
		},
		dataLabels: { enabled: true, formatter: (val) => val + ' Stk.' },
		xaxis: {
			categories: [],
			labels: { style: { fontFamily: 'Inter, sans-serif' } }
		},
		grid: { show: false }
	});

	onMount(async () => {
		const data = await getOpenPositions();
		if (data.length === 0) return;

		options = {
			...options,
			series: [{ name: 'Offene Stücke', data: data.map((d) => d.openQuantity) }],
			xaxis: {
				...options.xaxis,
				categories: data.map((d) => d.symbol)
			}
		};
	});
</script>

<Card class="p-4 md:p-6">
	<h5 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Offene Positionen</h5>
	{#if (options.series as []).length === 0}
		<p class="text-center text-gray-400 py-16">Keine offenen Positionen.</p>
	{:else}
		<Chart {options} />
	{/if}
</Card>
