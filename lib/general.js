/**
 * @author Ragger Jonkers "poezedoez" <ragger@xs4all.nl>
 */

/** Write 2D (row, column) data as a CSV */
export async function writeAsCsv(ns, fileName, data, header) {
	if (!fileName.endsWith(".txt")) {
		ns.tprint("Error: provide a .txt destination file for the csv.");
		ns.exit();
	}
	ns.clear(fileName);
	if (header) await writeCsvRow(ns, fileName, header);
	for (let i = 0; i < data.length; i++) {
		await writeCsvRow(ns, fileName, data[i]);
	};
}

/** Write a row seperated by delimiter ending with newLineCharacter */
export async function writeCsvRow(ns, fileName, row, delimiter = ',', newLineCharacter = '\r\n') {
	const rowString = row.join(delimiter) + newLineCharacter;
	await ns.write(fileName, rowString, 'a');
}

/** Read a CSV file */
export async function readCsv(ns, fileName, delimiter = ',', newLineCharacter = '\r\n') {
	if (!fileName.endsWith(".txt")) {
		ns.tprint("Error: provide a .txt file to read from.");
		ns.exit();
	}
	const csvData = [];
	const file = await ns.read(fileName);
	const rows = file.split(newLineCharacter);
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i].split(delimiter);
		if(row[0] !== "") {
			csvData.push(row);
		}
		
	}

	return csvData;
}

/**
 * function that returns a filtered version of a 2D data array.
 * @param {Array.<Array>} data array of the data to filter
 * @param {dict} query object in which the keys are column indices (0 points to the first column) 
 * and the values are callback functions that are applied to the specified columns for filtering.
 * @return {Array.<Array>} filtered data.
 */
export async function filterData2D(data, query) {
	const filteredData = [];

	data.forEach(row => {
		let matchesQuery = true;
		Object.keys(query).forEach(index => {
			const callbackFunction = query[index];
			if (!callbackFunction(row[index])) {
				matchesQuery = false;
			}
		});
		if (matchesQuery) {
			filteredData.push(row);
		}
	})

	return filteredData;
}

// @author u/havoc_mayhem
export function format(num) {
    let symbols = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc"];
    let i = 0;
    for(; (num >= 1000) && (i < symbols.length); i++) num /= 1000;
    return "$"+`${num.toFixed(3)} ${symbols[i]}`;
}