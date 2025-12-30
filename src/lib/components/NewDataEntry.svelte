<script lang="ts">
    import { enterNewStockToDB } from '$lib/database/db';

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	let buyEntry = $state(true);

	let stockName = $state('');
	let date = $state('');
	let price = $state('');
	let notes = $state('');
    let quantity = $state('');

	// Computed reactive state
	const isFormValid = $derived(stockName.trim().length > 0 && date.trim().length > 0 && parseFloat(price) > 0 && parseFloat(quantity) > 0);

	function saveEntry() {
		// your save logic here
		if (isFormValid) {
			console.log('Saving entry:', {
				type: buyEntry ? 'Buy' : 'Sell',
				stockName,
				date,
				price: parseFloat(price),
				notes
			});
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
		<input
			id="stock-name"
			bind:value={stockName}
			type="text"
			placeholder="AAPL"
			class="rounded border px-2 py-1 transition outline-none {isValidStockName
				? 'border-green-500 focus:border-green-600'
				: 'border-primary-300 focus:border-primary-400'}"
		/>
	</div>

	<!-- Date -->
	<div class="field">
		<label for="date">Date</label>
		<input
			id="date"
			bind:value={date}
			type="date"
			class="rounded border px-2 py-1 transition outline-none {isValidDate
				? 'border-green-500 focus:border-green-600'
				: 'border-primary-300 focus:border-primary-400'}"
		/>
	</div>

    <!-- Quantitity -->
    <div class="field">
		<label for="quantity" class={isValidStockName ? 'text-green-600' : ''}> Quantity </label>
		<input
			id="quantity"
			bind:value={quantity}
			type="text"
			placeholder="AAPL"
			class="rounded border px-2 py-1 transition outline-none {isValidStockName
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
		<button class="btn-standard" onclick={saveEntry}>Save Entry</button>
	</div>
</div>
