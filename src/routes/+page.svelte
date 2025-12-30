<script lang="ts">
	import { BarChart, NewDataEntry } from '$lib';

	let showDataEntry = $state(false);

	import { addTestTrade, getDB } from '$lib/database/db'; // DEBUG
	let result = $state('');
</script>

<!-- Page Content -->
<main>
	<div id="top"></div>
	<div class="main-banner">
		<div style="margin: 2rem;">
			<button onclick={() => (showDataEntry = !showDataEntry)} class="btn-standard"
				>Enter new stock</button
			>

			{#if showDataEntry}
				<NewDataEntry onClose={() => (showDataEntry = false)} />
			{/if}
		</div>

		<div>
			<!-- DEBUG -->
			<button
				onclick={async () => {
					await addTestTrade();
				}}
				class="btn-cancel">ADD TEST TRADE</button
			>

			<button
				onclick={async () => {
					const data = await getDB();
					result = JSON.stringify(data, null, 2);
				}}
				class="btn-cancel">Get DB</button
			>

			<textarea readonly style="width: 100%; height: 200px; margin-top: 1rem;">{result}</textarea>
		</div>

		<h3>Graphes</h3>
		<div id="barchart" style="margin: 0.5rem;">
			<BarChart />
		</div>
	</div>
</main>
