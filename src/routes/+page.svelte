<script lang="ts">
	import { BarChart } from '$lib';

	  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import {
    getLocalTimeZone,
    today,
    type CalendarDate
  } from "@internationalized/date";

  const id = $props.id();
    let open = $state(false);
  let value = $state<CalendarDate | undefined>();

	let newDataEntry = false;
	$: buyEntry = true;

	let stockName = '';
	let date = '';
	let price = '';
	let notes = '';

	// Computed reactive state
	$: isValidStockName = stockName.trim().length > 0;
	$: isValidDate = date.trim().length > 0;
	$: isValidPrice = parseFloat(price) > 0;
	$: isFormValid = isValidStockName && isValidDate && isValidPrice;

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

<!-- Page Content -->

<main>
	<div id="top"></div>
	<div class="main-banner">
		<div style="margin: 2rem;">
			<button onclick={() => (newDataEntry = !newDataEntry)}>Enter new stock</button>

			{#if newDataEntry}
				<div id="data-entry-card" class="data-entry-container">
					<!-- Header -->
					<div class="header-row">
						<h3 class="title">New Stock Entry</h3>
					</div>

					<!-- Buy / Sell Switch -->
					<div class="buy-sell-toggle">
						<button
							class:toggle-active={buyEntry}
							class="toggle-left"
							onclick={() => (buyEntry = true)}
						>
							Buy
						</button>
						<button
							class:toggle-active={!buyEntry}
							class="toggle-right"
							onclick={() => (buyEntry = false)}
						>
							Sell
						</button>
					</div>

					<!-- Stock Name -->

					<div class="field">
						<label class={isValidStockName ? 'text-green-600' : ''}>Stock Name</label>

						<input
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
						<label>Date</label>
						<input
							bind:value={date}
							type="date"
							class="rounded border px-2 py-1 transition outline-none {isValidDate
								? 'border-green-500 focus:border-green-600'
								: 'border-primary-300 focus:border-primary-400'}"
						/>
					</div>

					<div class="flex flex-col gap-3">
  <Label for="{id}-date" class="px-1">Date of birth</Label>
  <Popover.Root bind:open>
    <Popover.Trigger id="{id}-date">
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          class="justify-between w-48 font-normal"
        >
          {value
            ? value.toDate(getLocalTimeZone()).toLocaleDateString()
            : "Select date"}
          <ChevronDownIcon />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="p-0 w-auto overflow-hidden" align="start">
      <Calendar
        type="single"
        bind:value
        captionLayout="dropdown"
        onValueChange={() => {
          open = false;
        }}
        maxValue={today(getLocalTimeZone())}
      />
    </Popover.Content>
  </Popover.Root>
</div>

					<!-- Price -->
					<div class="field">
						{#if buyEntry}
						<label>Purchase Price</label>
						{:else}
						<label>Selling Price</label>
						{/if}
						<input
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
						<label>Notes</label>
						<textarea bind:value={notes} rows="3" placeholder="Optional notes..."></textarea>
					</div>

					<!-- Actions -->
					<div class="actions">
						<button class="btn-cancel" onclick={() => (newDataEntry = false)}>Cancel</button>
						<button class="btn-save" onclick={saveEntry}>Save Entry</button>
					</div>
				</div>
			{/if}
		</div>

		<h3>Graphes</h3>
		<div id="barchart">
			<BarChart />
		</div>
	</div>
</main>
