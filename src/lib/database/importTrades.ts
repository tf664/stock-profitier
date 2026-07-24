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

		// Async normalizeTrade(row) machen?

		// Nur ASSETKLASSE "SHARE" berücksichtigen

		// Felder mappen symbol: KÜRZEL buyDate: VALUTADATUM quantity: STÜCKE fees: GEBÜHREN IN KONTOWÄHRUNG ...

		// Kaufkurs berechnen aus "STÜCKE" "ANLAGEBETRAG IN KONTOWÄHRUNG" und "GEBÜHREN IN KONTOWÄHRUNG"

		// Zahlen richtig parsen 94,4 -> 94.4

		// BUY importieren

		// SELL importieren

		// isin, wkn, assetClass, exchange in db? isin als klarer identifier
		// BUY | anlagebtrag -> kaufwert, gebühren -> kosten | SELL | Anlagebtrag -> Verkaufserlös, gebühren -> kosten
	}
}
