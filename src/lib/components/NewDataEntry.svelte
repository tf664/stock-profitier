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

	import { addBuy, addSell, getOpenPositions, type OpenPosition } from '$lib/database/db';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';

	const id = $props.id();

	let open = $state(false);

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	// ─── Sell Combobox ───────────────────────────────────────────────────────

	let sellOptionsLoaded = $state(false);

	type SellOption = {
		value: string;   // symbol
		label: string;   // symbol (angezeigt)
		quantity: number;
	};

	let sellOptions: SellOption[] = $state([]);
	let sellComboBoxOpen = $state(false);
	let selectedSellOption = $state<SellOption | null>(null);

	// ─── Desktop / Mobile ────────────────────────────────────────────────────

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

	// Sell-Optionen laden wenn auf "Sell" gewechselt wird
	$effect(() => {
		if (!buyEntry && !sellOptionsLoaded) {
			fillSellOptions();
			sellOptionsLoaded = true;
		} else if (buyEntry) {
			sellOptionsLoaded = false;
			selectedSellOption = null;
		}
	});

	function handleSellComboBoxSelect(value: string) {
		selectedSellOption = sellOptions.find((o) => o.value === value) ?? null;
		sellComboBoxOpen = false;
	}

	async function fillSellOptions() {
		sellOptions = [];
		const positions = await getOpenPositions();

		if (positions.length === 0) {
			sellOptions = [{ value: 'no-entries', label: 'Keine offenen Positionen', quantity: 0 }];
			return;
		}

		sellOptions = positions.map((p) => ({
			value: p.symbol,
			label: `${p.symbol} (${p.openQuantity} Stk.)`,
			quantity: p.openQuantity
		}));
	}

	// ─── Form State ──────────────────────────────────────────────────────────

	let buyEntry = $state(true);

	let stockName = $state('');
	let stockSymbols = ['', '']; // TODO: fill stock symbols with existing symbols from DB for autocomplete ANd style them to be not in the way of the keyboard
	let entryDate = $state<CalendarDate | undefined>();
	let price = $state(1.0);
	let quantity = $state(1);
	let fees = $state(0.0);
	let notes = $state('');

	let showSuccessDialog = $state(false);
	let savedEntryDetails = $state('');

	// ─── Validation ──────────────────────────────────────────────────────────

	const isValidStockName = $derived(
		buyEntry ? stockName.length > 0 : selectedSellOption !== null && selectedSellOption.value !== 'no-entries'
	);
	const isValidDate     = $derived(entryDate !== undefined);
	const isValidPrice    = $derived(price > 0);
	const isValidQuantity = $derived(
		quantity > 0 &&
		(!buyEntry && selectedSellOption ? quantity <= selectedSellOption.quantity : true)
	);
	const isFormValid = $derived(isValidStockName && isValidDate && isValidPrice && isValidQuantity);

	// ─── Save ────────────────────────────────────────────────────────────────

	async function saveEntry() {
		if (!isFormValid || !entryDate) return;

		const date = entryDate.toDate(getLocalTimeZone());

		if (buyEntry) {
			await addBuy(stockName, date, quantity, price, fees, 'EUR', notes || undefined);
			savedEntryDetails = `Kauf: ${quantity} x ${stockName} à ${price.toFixed(2)} € gespeichert.`;
		} else if (selectedSellOption) {
			await addSell(selectedSellOption.value, date, quantity, price, fees, 'EUR', notes || undefined);
			savedEntryDetails = `Verkauf: ${quantity} x ${selectedSellOption.value} à ${price.toFixed(2)} € gespeichert.`;
		}

		// Form zurücksetzen
		stockName = '';
		entryDate = undefined;
		price = 1.0;
		quantity = 1;
		fees = 0.0;
		notes = '';
		selectedSellOption = null;
		sellOptionsLoaded = false;

		showSuccessDialog = true;
	}
</script>

<div id="data-entry-card" class="data-entry-container">
	<!-- Header -->
	<div class="header-row">
		<h3 class="title">New Stock Entry</h3>
	</div>

	<!-- Buy / Sell Toggle -->
	<div class="buy-sell-toggle">
		<button class:toggle-active={buyEntry} class="toggle-left" onclick={() => (buyEntry = true)}>Buy</button>
		<button class:toggle-active={!buyEntry} class="toggle-right" onclick={() => (buyEntry = false)}>Sell</button>
	</div>

	<!-- Stock Name / Symbol -->
	<div class="field">
		<label for="stock-name" class={isValidStockName ? 'text-green-600' : ''}>
			Stock Symbol
		</label>

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
			<Popover.Root bind:open={sellComboBoxOpen}>
				<Popover.Trigger>
					<Button variant="outline" class="w-[200px] justify-start">
						{selectedSellOption ? selectedSellOption.label : '+ Symbol wählen'}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[220px] p-0" align="start">
					<Command.Root>
						<Command.Input placeholder="Symbol suchen..." />
						<Command.List>
							<Command.Empty>Keine Ergebnisse.</Command.Empty>
							<Command.Group>
								{#each sellOptions as option (option.value)}
									<Command.Item value={option.value} onSelect={() => handleSellComboBoxSelect(option.value)}>
										{option.label}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>

		{:else}
			<Drawer.Root bind:open={sellComboBoxOpen}>
				<Drawer.Trigger>
					<Button variant="outline" class="w-[200px] justify-start">
						{selectedSellOption ? selectedSellOption.label : '+ Symbol wählen'}
					</Button>
				</Drawer.Trigger>
				<Drawer.Content>
					<div class="mt-4 border-t">
						<Command.Root>
							<Command.Input placeholder="Symbol suchen..." />
							<Command.List>
								<Command.Empty>Keine Ergebnisse.</Command.Empty>
								<Command.Group>
									{#each sellOptions as option (option.value)}
										<Command.Item value={option.value} onSelect={() => handleSellComboBoxSelect(option.value)}>
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

		<!-- Warnung wenn Quantity > verfügbare Stücke -->
		{#if !buyEntry && selectedSellOption && quantity > selectedSellOption.quantity}
			<p class="text-red-500 text-sm mt-1">
				Max. {selectedSellOption.quantity} Stk. verfügbar
			</p>
		{/if}
	</div>

	<!-- Date -->
	<div class="field">
		<Label for={id + '-date'} class="px-1">
			{buyEntry ? 'Kaufdatum' : 'Verkaufsdatum'}
		</Label>
		<Popover.Root bind:open={open}>
			<Popover.Trigger id={id + '-date'}>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-48 justify-between font-normal">
						{entryDate ? entryDate.toDate(getLocalTimeZone()).toLocaleDateString() : 'Datum wählen'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={entryDate}
					captionLayout="dropdown"
					onValueChange={() => { open = false; }}
					maxValue={today(getLocalTimeZone())}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- Quantity -->
	<div class="field">
		<label for="quantity" class={isValidQuantity ? 'text-green-600' : 'text-red-500'}>
			Anzahl
		</label>
		<input
			id="quantity"
			bind:value={quantity}
			type="number"
			step="0.5"
			min="0.5"
			placeholder="10"
			class="rounded border px-2 py-1 transition outline-none {isValidQuantity
				? 'border-green-500 focus:border-green-600'
				: 'border-red-400 focus:border-red-500'}"
		/>
	</div>

	<!-- Price -->
	<div class="field">
		<label for="price">{buyEntry ? 'Kaufpreis' : 'Verkaufspreis'} (pro Stk.)</label>
		<input
			id="price"
			bind:value={price}
			type="number"
			step="0.01"
			min="0.01"
			placeholder="152.35"
			class="rounded border px-2 py-1 transition outline-none {isValidPrice
				? 'border-green-500 focus:border-green-600'
				: 'border-primary-300 focus:border-primary-400'}"
		/>
	</div>

	<!-- Fees -->
	<div class="field">
		<label for="fees">Gebühren (optional)</label>
		<input
			id="fees"
			bind:value={fees}
			type="number"
			step="0.01"
			min="0"
			placeholder="3.90"
			class="rounded border px-2 py-1 transition outline-none border-primary-300 focus:border-primary-400"
		/>
	</div>

	<!-- Notes -->
	<div class="field">
		<label for="notes">Notizen</label>
		<textarea
			id="notes"
			bind:value={notes}
			rows="2"
			placeholder="Optional..."
			class="px-2 py-1 border border-color-sidebar-border rounded-md outline-none transition"
		></textarea>
	</div>

	<!-- Actions -->
	<div class="actions">
		<button class="btn-cancel" onclick={() => onClose?.()}>Abbrechen</button>
		<button
			class="active:brightness-90 active:scale-95 transition-transform btn-standard"
			style:background-color={!isFormValid ? 'var(--color-primary-deactivated)' : ''}
			style:opacity={!isFormValid ? '0.6' : '1'}
			onclick={saveEntry}
		>
			Speichern
		</button>
	</div>
</div>

<!-- Success Dialog -->
<AlertDialog bind:open={showSuccessDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Gespeichert</AlertDialogTitle>
			<AlertDialogDescription>
				{savedEntryDetails}
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogAction onclick={() => { showSuccessDialog = false; onClose?.(); }}>
				OK
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>