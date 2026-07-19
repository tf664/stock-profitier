<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	import { chartData } from '$lib/utils/dataHandler';

	const options: ApexOptions = {
		series: [...chartData.series],
		chart: {
			sparkline: {
				enabled: false
			},
			type: 'bar',
			width: '100%',
			height: 400,
			toolbar: {
				show: false
			}
		},
		fill: {
			opacity: 1
		},
		plotOptions: {
			bar: {
				horizontal: true,
				columnWidth: '100%',
				borderRadiusApplication: 'end',
				borderRadius: 6,
				dataLabels: {
					position: 'top'
				}
			}
		},
		legend: {
			show: true,
			position: 'bottom'
		},
		dataLabels: {
			enabled: false
		},
		tooltip: {
			shared: true,
			intersect: false
		},
		xaxis: {
			labels: {
				show: true,
				style: {
					fontFamily: 'Inter, sans-serif',
					cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
				},
				formatter: function (value) {
					return value + '€';
				}
			},
			categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			axisTicks: {
				show: false
			},
			axisBorder: {
				show: false
			}
		},
		yaxis: {
			labels: {
				show: true,
				style: {
					fontFamily: 'Inter, sans-serif',
					cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
				}
			}
		},
		grid: {
			show: true,
			strokeDashArray: 4,
			padding: {
				left: 2,
				right: 2,
				top: -20
			}
		}
	};
</script>

<Card.Root class="chart-card">
	<Card.Header class="chart-header">
		<div>
			<Card.Title class="chart-title">Profit</Card.Title>
			<p class="chart-value">hc 5,405€</p>
		</div>
		<div>
			<span class="inline-flex items-center gap-1.5 chart-badge">
				<ArrowUpIcon class="w-2.5 h-2.5" />
				Profit rate 23.5% hc
			</span>
		</div>
	</Card.Header>

	<Card.Content>
		<div class="chart-stats-grid">
			<dl>
				<dt class="chart-stat-label">Income</dt>
				<dd class="chart-income">hc €23,635€</dd>
			</dl>
			<dl>
				<dt class="chart-stat-label">Expense</dt>
				<dd class="chart-expense">hc -18,230€</dd>
			</dl>
		</div>

		<Chart {options} />
	</Card.Content>

	<Card.Footer class="chart-footer">
		<div class="chart-footer-content">
			<Button variant="ghost" class="chart-button">
				Last 7 days
				<ChevronDownIcon class="ml-2 w-2.5 h-2.5" />
			</Button>
			<Button href="/" variant="link" class="chart-link">
				Leads Report
				<ChevronRightIcon class="ml-1.5 w-2.5 h-2.5" />
			</Button>
		</div>
	</Card.Footer>
</Card.Root>
