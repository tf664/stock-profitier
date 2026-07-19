<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import { Card } from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { getMonthlyVolume } from '$lib/database/db';

	let options: ApexOptions = $state({
		series: [],
		chart: {
			type: 'bar',
			height: 320,
			fontFamily: 'Inter, sans-serif',
			toolbar: { show: false }
		},
		colors: ['#31C48D', '#F05252'],
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '60%',
				borderRadius: 6,
				borderRadiusApplication: 'end'
			}
		},
		dataLabels: { enabled: false },
		legend: { show: true, position: 'bottom' },
		tooltip: {
			shared: true,
			intersect: false,
			y: { formatter: (val) => '€' + val.toFixed(2) }
		},
		xaxis: {
			categories: [],
			labels: {
				style: { fontFamily: 'Inter, sans-serif', cssClass: 'text-xs fill-gray-500' }
			},
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: {
			labels: { formatter: (val) => '€' + val.toFixed(0) }
		},
		grid: { show: true, strokeDashArray: 4 }
	});

	onMount(async () => {
		const data = await getMonthlyVolume();
		if (data.length === 0) return;

		options = {
			...options,
			series: [
				{ name: 'Gekauft', color: '#31C48D', data: data.map((d) => d.bought) },
				{ name: 'Verkauft', color: '#F05252', data: data.map((d) => d.sold) }
			],
			xaxis: {
				...options.xaxis,
				categories: data.map((d) => d.month)
			}
		};
	});
</script>

<Card class="p-4 md:p-6">
	<h5 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Monatliches Volumen</h5>
	{#if (options.series ?? []).length === 0}
		<p class="text-center text-gray-400 py-16">Noch keine Transaktionen vorhanden.</p>
	{:else}
		<Chart {options} />
	{/if}
</Card>
