<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import { Card, A, Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ArrowUpOutline, ChevronDownOutline, ChevronRightOutline } from 'flowbite-svelte-icons';

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

<Card class="chart-card">
	<div class="chart-header">
		<dl>
			<dt class="chart-title">Profit</dt>
			<dd class="chart-value">hc 5,405€</dd>
		</dl>
		<div>
			<span class="chart-badge">
				<ArrowUpOutline class="me-1.5 w-2.5 h-2.5" />
				Profit rate 23.5% hc
			</span>
		</div>
	</div>

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
	<div class="chart-footer">
		<div class="chart-footer-content">
			<Button class="chart-button">
				Last 7 days<ChevronDownOutline class="m-2.5 ms-1.5 w-2.5" />
			</Button>
			<Dropdown simple class="w-40" offset={-6}>
				<DropdownItem>Yesterday</DropdownItem>
				<DropdownItem>Today</DropdownItem>
				<DropdownItem>Last 7 days</DropdownItem>
				<DropdownItem>Last 30 days</DropdownItem>
				<DropdownItem>Last 90 days</DropdownItem>
			</Dropdown>
			<A href="/" class="chart-link">
				Leads Report
				<ChevronRightOutline class="ms-1.5 w-2.5 h-2.5" />
			</A>
		</div>
	</div>
</Card>
