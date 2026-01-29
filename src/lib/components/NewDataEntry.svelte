<script lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';

	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';

	import {
		enterNewBuyStockToDB,
		enterNewSellStockToDB,
		getAvailableSellEntries
	} from '$lib/database/db';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';

	const id = $props.id();

	let open = $state(false);

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	let sellOptionsLoaded = $state(false);
	type Status = {
		value: string;
		label: string;
		quantity: number;
	};
	let sellOptions: Status[] = $state([]);

	let sellComboBoxOpen = $state(false);
	let selectedSellCB: Status | null = $state(null);
	let isDesktop = $state(false);

	function checkScreenSize() {
		isDesktop = window.innerWidth >= 768;
	}

	onMount(() => {
		if (browser) {
			checkScreenSize();
			window.addEventListener('resize', checkScreenSize);
			return () => window.removeEventListener('resize', checkScreenSize);
		}
	});

	$effect(() => {
		if (!buyEntry && !sellOptionsLoaded) {
			fillSellOptions();
			sellOptionsLoaded = true;
		} else if (buyEntry) sellOptionsLoaded = false;
	});

	function handleSellComboBox(value: string) {
		selectedSellCB = sellOptions.find((sell) => sell.value === value) || null;
		sellComboBoxOpen = false;
	}

	async function fillSellOptions() {
		sellOptions = [];

		const availableEntries = await getAvailableSellEntries();

		if (availableEntries.length === 0) {
			sellOptions.push({ value: 'no-entries', label: 'No available sell entries', quantity: 0 });
			return;
		}

		for (const entry of availableEntries) {
			sellOptions.push({ value: entry.id, label: entry.symbol, quantity: entry.availableQuantity });
		}
	}

	let buyEntry = $state(true);

	let stockName = $state('');
	let stockSymbols = [
		'AAPL',
		'MSFT',
		'GOOGL',
		'AMZN',
		'TSLA',
		'META',
		'NVDA',
		'NFLX',
		'AMD',
		'INTC'
	];
	let buyDate = $state<CalendarDate | undefined>();
	let price = $state(1.0);
	let notes = $state('');
	let quantity = $state(1);

	let showSuccessDialog = $state(false);
	let savedEntryDetails = $state('');

	// Computed reactive state
	const isValidStockName = $derived(stockName.length > 0);
	const isValidDate = $derived(buyDate !== undefined);
	const isValidPrice = $derived(price > 0);
	const isValidQuantity = $derived(quantity > 0);
	const isFormValid = $derived(isValidStockName && isValidDate && isValidPrice && isValidQuantity);

	function saveEntry() {
		// your save logic here
		if (isFormValid) {
			console.log('Saving entry:', {
				type: buyEntry ? 'Buy' : 'Sell',
				stockName,
				date: buyDate,
				price: price,
				notes
			});

			if (buyEntry && buyDate) {
				enterNewBuyStockToDB(
					stockName,
					buyDate.toDate(getLocalTimeZone()),
					quantity,
					price,
					notes ?? undefined
				);
			} else if (!buyEntry) {
				enterNewSellStockToDB();
			}

			fillSellOptions();

			// Set success message and show dialog
			savedEntryDetails = `${buyEntry ? 'Buy' : 'Sell'} order for ${quantity} shares of ${stockName} at $${price.toFixed(2)} saved successfully!`;
			showSuccessDialog = true;
		}
	}
</script>

<div id="data-entry-card" class="data-entry-container">
	<!-- Header -->
	<div class="header-row">
		<h3 class="title">New Stock Entry</h3>
	</div>

	<!-- Buy / Sell Switch -->
	<div class="buy-sell-toggle">
		<button class:toggle-active={buyEntry} class="toggle-left" onclick={() => (buyEntry = true)}>
			Buy
		</button>
		<button class:toggle-active={!buyEntry} class="toggle-right" onclick={() => (buyEntry = false)}>
			Sell
		</button>
	</div>

	<!-- Stock Name -->
	<div class="field">
		<label for="stock-name" class={isValidStockName ? 'text-green-600' : ''}> Stock Name </label>
		{#if buyEntry}
			<input
				id="stock-name"
				bind:value={stockName}
				type="text"
				list="stock-symbols"
				placeholder="AAPL"
				class="rounded border px-2 py-1 transition outline-none {isValidStockName
					? 'border-green-500 focus:border-green-600'
					: 'border-primary-300 focus:border-primary-400'}"
			/>
			<datalist id="stock-symbols">
				{#each stockSymbols as symbol}
					<option value={symbol}></option>
				{/each}
			</datalist>
		{:else if isDesktop}
			<Popover.Root bind:open>
				<Popover.Trigger>
					<Button variant="outline" class="w-[150px] justify-start">
						{selectedSellCB ? selectedSellCB.label : '+ Set Selling Stock'}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0" align="start">
					<Command.Root>
						<Command.Input placeholder="Select selling stock..." />
						<Command.List>
							<Command.Empty>No results found.</Command.Empty>
							<Command.Group>
								{#each sellOptions as option (option.value)}
									<Command.Item
										value={option.value}
										onSelect={() => handleSellComboBox(option.value)}
									>
										{option.label}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		{:else}
			<Drawer.Root bind:open>
				<Drawer.Trigger>
					<Button variant="outline" class="w-[150px] justify-start">
						{selectedSellCB ? selectedSellCB.label : '+ Set Selling Stock'}
					</Button>
				</Drawer.Trigger>
				<Drawer.Content>
					<div class="mt-4 border-t">
						<Command.Root>
							<Command.Input placeholder="Select selling stock..." />
							<Command.List>
								<Command.Empty>No results found.</Command.Empty>
								<Command.Group>
									{#each sellOptions as option (option.value)}
										<Command.Item
											value={option.value}
											onSelect={() => handleSellComboBox(option.value)}
										>
											{option.label}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		{/if}
	</div>

	<!-- Date -->
	<div class="field">
		<!-- 	<div class="flex flex-col gap-3">-->
		<Label for="{id}-date" class="px-1">Date of birth</Label>
		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date">
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-48 justify-between font-normal">
						{buyDate ? buyDate.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={buyDate}
					captionLayout="dropdown"
					onValueChange={() => {
						open = false;
					}}
					maxValue={today(getLocalTimeZone())}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- Quantitity -->
	<div class="field">
		<label for="quantity" class={isValidQuantity ? 'text-green-600' : ''}> Quantity </label>
		<input
			id="quantity"
			bind:value={quantity}
			type="number"
			step="0.5"
			min="0"
			placeholder="10"
			class="rounded border px-2 py-1 transition outline-none {isValidQuantity
				? 'border-green-500 focus:border-green-600'
				: 'border-primary-300 focus:border-primary-400'}"
		/>
	</div>

	<!-- Price -->
	<div class="field">
		{#if buyEntry}
			<label for="price">Purchase Price</label>
		{:else}
			<label for="price">Selling Price</label>
		{/if}
		<input
			id="price"
			bind:value={price}
			type="number"
			step="0.01"
			min="0"
			placeholder="152.35"
			class="rounded border px-2 py-1 transition outline-none {isValidPrice
				? 'border-green-500 focus:border-green-600'
				: 'border-primary-300 focus:border-primary-400'}"
		/>
	</div>

	<!-- Notes -->
	<div class="field">
		<label for="notes">Notes</label>
		<textarea
			id="notes"
			bind:value={notes}
			rows="2"
			placeholder="Optional notes..."
			class="px-2 py-1 border border-color-sidebar-border rounded-md outline-none transition"
		></textarea>
	</div>

	<!-- Actions -->
	<div class="actions">
		<button class="btn-cancel" onclick={() => onClose?.()}>Cancel</button>
		<button
			class="active:brightness-90 active:scale-95 transition-transform btn-standard"
			style:background-color={!isFormValid ? 'var(--color-primary-deactivated)' : ''}
			style:opacity={!isFormValid ? '0.6' : '1'}
			onclick={saveEntry}
		>
			Save Entry
		</button>
	</div>
</div>

<AlertDialog bind:open={showSuccessDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Entry Saved</AlertDialogTitle>
			<AlertDialogDescription>
				{savedEntryDetails}
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogAction
				onclick={() => {
					showSuccessDialog = false;
					onClose?.();
				}}
			>
				OK
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
