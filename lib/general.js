/**
 * @author Ragger Jonkers "poezedoez" <ragger@xs4all.nl>
 */

/**
 * Write data with header as CSV formatted .txt file.
 * @param {} ns NetScript lib.
 * @param {string} fileName path to the file to write to.
 * @param {Array} data Data values.
 * @param {Array} header Header (= column names).
 */
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

/**
 * Write (append) a CSV formatted line to .txt file.
 * @param {} ns NetScript lib.
 * @param {string} fileName path to the file to write to.
 * @param {string=} delimiter Character that separates tokens on a line.
 * @param {string=} newLineCharacter Character that separates lines.
 */
export async function writeCsvRow(ns, fileName, row, delimiter = ',', newLineCharacter = '\r\n') {
	const rowString = row.join(delimiter) + newLineCharacter;
	await ns.write(fileName, rowString, 'a');
}

/**
 * Read a .txt file formatted like a CSV file.
 * @param {} ns NetScript lib.
 * @param {string} fileName path to the file to read.
 * @param {string=} delimiter Character that separates tokens on a line.
 * @param {string=} newLineCharacter Character that separates lines.
 * @return {Array} Data array.
 */
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

/**
 * function that returns a formatted monetary value as string.
 * @param {number} num number to format
 * @return {string} monetary value, e.g. "$100K" .
 */
export function formatMoney(num) {
    let symbols = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc"];
    let i = 0;
    for(; (num >= 1000) && (i < symbols.length); i++) num /= 1000;
    return "$"+`${num.toFixed(3)} ${symbols[i]}`;
}

/**
 * Function that returns a formatted memory value as string.
 * Does not return exact bytes, but base 10 of it.
 * @param {number} num number to format in bytes
 * @return {string} memory value, e.g. "128GB" .
 */
export function formatBytes(bytes) {
    let symbols = ["B","KB","MB","GB","TB","PB"];
    let i = 0;
    for(; (bytes >= 1000) && (i < symbols.length); i++) bytes /= 1000;
    return `${bytes} ${symbols[i]}`;
}

/**
 * Function that returns the complement set from a file with names.
 * @param {} ns NetScript lib.
 * @param {string} file The file with all existing names listed (e.g. targets / hosts).
 * @param {Array} selected The array of selected names to take the complement set of.
 * @return {Array} The set of complement names.
 */
export async function getComplements(ns, file, selected) {
	let complements = await readCsv(ns, file);
	complements = complements.map(row => row[0]).filter(value => value !== "");
	selected.forEach(s => {
		const index = complements.findIndex(value => value === s);
		if(index > -1) {
			complements.splice(index,1);
		}
	});

	return complements;
}