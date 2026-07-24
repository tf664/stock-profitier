import Papa from 'papaparse';

import { addBuy, addSell } from './db';

export function handleImport(files: FileList | null) {
	// Implementation for handling import logic
	if (!files || files.length === 0) return;

	const file = files[0];

	Papa.parse(file, {
		header: true,
		skipEmptyLines: true,
		complete: (results) => {
			processData(results);
		},
		error: (error) => {
			console.error(error);
		}
	});
}

function processData(results: Papa.ParseResult<any>) {
	for (const row of results.data) {
		if (row['STATUS DER TRANSAKTION'] !== 'EXECUTED') {
			console.log(`Skipping ${row['KÜRZEL']} as it is not executed.`);
			continue;
		}
	}
}
