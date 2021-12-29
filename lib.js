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
export async function applyToServers(ns, serverFunction, exclude=[], loop=false) {

	let visitedServers = new Set(exclude);
	const startingServer = "home";

	do {
		// Start recursion for this round
		const adjacentServers = ns.scan(startingServer);
		const results = await applyToServers_(adjacentServers, []);

		// Return results if not looping 
		if(!loop) {
			return Promise.all(results);
		}

		// Prepare next round
		visitedServers = new Set(exclude);

		// Be patient
		await ns.sleep(10000);

	} while (loop);


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
			const result = await applyToServer_(nextServer);
			results.push(result);
			const adjacentServers = ns.scan(nextServer);

			// Go deeper into the recursion
			await applyToServers_(adjacentServers, results);
		}

		// Finish visiting the rest of the adjacent servers (besides the first)
		await applyToServers_(servers, results);

		// Return the accumulated results from serverFunctions (optional)
		return results;

	}
	
}

/** Write a row seperated by delimiter ending with newLineCharacter */
export function writeCsvRow(ns, fileName, row, delimiter=',', newLineCharacter='\r\n') {
    const rowString = row.join(delimiter) + newLineCharacter;
    ns.write(fileName, rowString, 'a');
}

/** Read a CSV file */
export async function readCsv(ns, fileName) {
    const file = ns.read(fileName);
    const rows = file.split(newLineCharacter);
    for (i = 0; i < rows.length; ++i) {
        const row = rows[i].split(delimiter);
        ns.print(row); // do stuff with data
    }   
}

export async function breachServer(ns, server) {

	if(ns.hasRootAccess(server)) {
		return true // already been breached
	}

	// Get server requirements for breaching
	const programs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	const programFunctions = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject];
	const programsOwned = programs.filter(program => ns.fileExists(program)).length;
	const requiredLevel = ns.getServerRequiredHackingLevel(server);
	const hackingLevel = ns.getHackingLevel();
	const hasRequiredLevel = hackingLevel >= requiredLevel;
	const requiredPortOpeners = ns.getServerNumPortsRequired(server);
	const hasEnoughPortOpeners = programsOwned >= requiredPortOpeners;


	if (hasRequiredLevel && hasEnoughPortOpeners) {
		ns.print(`Breaching gates of ${server}... \n`);

		// Break ports with owned programs
		programs.forEach((program, index) => {
			if (ns.fileExists(program)) {
				programFunctions[index](server);
			}
		});

		// Get root access
		ns.nuke(server);

		return true //breach successful

	}

	return false //breach unsuccessful

	
}
