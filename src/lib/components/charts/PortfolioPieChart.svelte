<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import { Card } from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { getInvestedPerSymbol } from '$lib/database/db';

	let options: ApexOptions = $state({
		series: [],
		labels: [],
		colors: ['#1C64F2', '#16BDCA', '#FDBA8C', '#E74694', '#9061F9', '#31C48D', '#F05252'],
		chart: {
			height: 320,
			width: '100%',
			type: 'donut'
		},
		stroke: { colors: ['transparent'] },
		plotOptions: {
			pie: {
				donut: {
					size: '75%',
					labels: {
						show: true,
						total: {
							showAlways: true,
							show: true,
							label: 'Gesamt investiert',
							formatter: (w) => {
								const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
								return '€' + sum.toFixed(0);
							}
						}
					}
				}
			}
		},
		dataLabels: { enabled: false },
		legend: { position: 'bottom', fontFamily: 'Inter, sans-serif' },
		tooltip: {
			y: { formatter: (val) => '€' + val.toFixed(2) }
		}
	});

	onMount(async () => {
		const data = await getInvestedPerSymbol();
		if (data.length === 0) return;

		options = {
			...options,
			series: data.map((d) => d.totalInvested),
			labels: data.map((d) => d.symbol)
		};
	});
</script>

<Card class="p-4 md:p-6">
	<h5 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Portfolio-Verteilung</h5>
	{#if (options.series as number[]).length === 0}
		<p class="text-center text-gray-400 py-16">Noch keine Käufe vorhanden.</p>
	{:else}
		<Chart {options} />
	{/if}
</Card>
