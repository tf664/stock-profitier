<script lang="ts">
	import { handleImport } from '$lib/database/importTrades';

	let files = $state<FileList | null>(null);

	$effect(() => {
		if (!files) return;

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`);
		}
	});
</script>

<div class="flex flex-col justify-center items-center gap-4 p-4">
	<h1 class="font-bold text-primary text-3xl">Import data from CSV</h1>
	<div class="space-y-2">
		<label for="importedDataFile" class="block font-medium text-foreground text-sm">
			Select file to import
		</label>

		<input
			type="file"
			accept=".csv"
			bind:files
			id="importedDataFile"
			name="importCsv"
			class="block bg-card file:bg-primary hover:file:opacity-90 file:px-4 file:py-2 border border-border file:border-0 rounded-lg file:rounded-md w-full file:font-medium text-foreground file:text-primary-foreground text-sm file:text-sm transition-colors cursor-pointer file:cursor-pointer"
		/>

		<p class="text-shadow-xs text-muted-foreground text-xs">
			Upload your Smartbroker+ CSV export. Only <span class="font-medium">.csv</span> files are supported.
		</p>
		<button onclick={() => (files = null)} class="btn-standard">Remove file</button>
	</div>

	<button onclick={() => handleImport(files)} class="btn-standard" disabled={files === null}
		>Import data from file</button
	>
</div>

<style>
</style>
