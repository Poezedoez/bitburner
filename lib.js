/**
 * @author Ragger Jonkers "poezedoez" <ragger@xs4all.nl>
 */


/** A recursive function that applies a given serverFunction 
 * to all servers in the game. 
 * @param {NS} ns
 * @param {fn} serverFunction Callback function 
 * with server as the callback argument.
 * @param {Array} exclude List of server names to exclude.
 */
export async function applyToServers(ns, serverFunction, exclude=[]) {

	let visitedServers = new Set(exclude);
	const startingServer = "home";

	// Start the recursion
	const adjacentServers = ns.scan(startingServer);
	const results = await applyToServers_(adjacentServers, []);
	return Promise.all(results);

	/** Apply function to a server */ 
	async function applyToServer_(server) {

		visitedServers.add(server);

		let result;
		try {
			result = serverFunction(server);
		}
		catch(e) {
			const message = `An error ocurred executing the serverFunction on '${server}': ${e}`
			ns.tprint(message);
			ns.print(message);
		}
		
		return result;

	}

	/** Recursively apply serverFunction to servers. */ 
	async function applyToServers_(servers, results) {

		// Base case
		if (!servers.length) {
			return results
		}

		// Grab the first server and visit it if we haven't already
		const nextServer = servers.shift();
		if (!visitedServers.has(nextServer)) {
			const result = applyToServer_(nextServer);
			results.push(result);
			const adjacentServers = ns.scan(nextServer);

			// Go deeper into the recursion
			applyToServers_(adjacentServers, results);
		}

		// Finish visiting the rest of the adjacent servers (besides the first)
		applyToServers_(servers, results);

		// Return the accumulated results from serverFunctions (optional)
		return results;

	}
	
}

/** Write a row seperated by delimiter ending with newLineCharacter */
export function writeCsvRow(fileName, row, delimiter=',', newLineCharacter='\r\n') {
    const rowString = row.join(delimiter) + newLineCharacter;
    ns.write(fileName, rowString, 'a');
}

/** Read a CSV file */
export async function readCsv(fileName) {
    const file = ns.read(fileName);
    const rows = file.split(newLineCharacter);
    for (i = 0; i < rows.length; ++i) {
        const row = rows[i].split(delimiter);
        ns.print(row); // do stuff with data
    }   
}
