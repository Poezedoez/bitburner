/**
 * @author Ragger Jonkers "poezedoez" <ragger@xs4all.nl>
 */

/** A recursive function that runs a given serverFunction 
 * on all (but excluded) servers in the game. 
 * @param {NS} ns
 * @param {fn} serverFunction Callback function 
 * with server as the callback argument. See serverFunctions.js.
 * @param {Array} exclude List of server names to exclude.
 */
export async function callOnServers(ns, serverFunction, exclude = [], loop = false, ...serverFunctionParams) {

	let visitedServers = new Set(exclude);
	const startingServer = "home";

	do {
		// Start recursion for this round
		const adjacentServers = ns.scan(startingServer);
		const results = await callOnServers_(adjacentServers, []);

		// Return results if not looping 
		if (!loop) {
			return Promise.all(results);
		}

		// Prepare next round
		visitedServers = new Set(exclude);

		// Be patient
		await ns.sleep(10000);

	} while (loop);


	/** Apply function to a server */
	async function callOnServer_(server) {

		visitedServers.add(server);

		let result;
		try {
			result = serverFunction(ns, server, ...serverFunctionParams);
		}
		catch (e) {
			const message = `An error ocurred executing the serverFunction on '${server}': ${e}`
			ns.tprint(message);
			ns.print(message);
		}

		return result;

	}

	/** Recursively apply server function to servers. */
	async function callOnServers_(servers, results) {

		// Base case
		if (!servers.length) {
			return results
		}

		// Grab the first server and visit it if we haven't already
		const nextServer = servers.shift();
		if (!visitedServers.has(nextServer)) {
			const result = await callOnServer_(nextServer);
			results.push(result);
			const adjacentServers = ns.scan(nextServer);

			// Go deeper into the recursion
			await callOnServers_(adjacentServers, results);
		}

		// Finish visiting the rest of the adjacent servers (besides the first)
		await callOnServers_(servers, results);

		// Return the accumulated results from serverFunctions (optional)
		return results;

	}

}

/*--------------------------------- FUNCTIONS TO CALL ON EACH SERVER ---------------------------------------- */

/** @param {NS} ns **/
export async function runScript(ns, server, script, scriptArgs) {
	
	if(!ns.hasRootAccess(server)) {
		ns.print(`No root access to ${server}, returning...`)
		return
	}

	// Copy script over
	await ns.scp(script, server);

	// Execute script on the target server (1 thread)
	if (threads > 0) {
		if(scriptArgs) {
			ns.exec(script, server, 1, ...scriptArgs);
		}
		else {
			ns.exec(script, server);
		}
		
		const message = `Script ${script} (${ns.getScriptRam(script)} GB RAM) deployed with
		 	a single thread on ${server}. \n`;
		ns.print(message);
		ns.tprint(message);
	}
}

export async function runScriptMaxThreads(ns, server, script, scriptArgs) {
	

	if(!ns.hasRootAccess(server)) {
		ns.print(`No root access to ${server}, returning...`)
		return
	}

	// Copy (hacking) script over
	await ns.scp(script, server);

	// Calculate usable threads
	const scriptCost = ns.getScriptRam(script);
	const serverRamUsed = ns.getServerUsedRam(server);
	const serverRamMax = ns.getServerMaxRam(server);
	const serverRamAvailable = serverRamMax - serverRamUsed;
	const threads = Math.floor(serverRamAvailable / scriptCost);

	// Execute script on the server with maximum threads
	if (threads > 0) {
		ns.exec(script, server, threads, ...scriptArgs);
		const message = `Script (${scriptCost} GB RAM) deployed on 
			${threads} threads on ${server}. \n`;
		ns.print(message);
	}
}

export async function breach(ns, server) {

	if(ns.hasRootAccess(server)) {
		return true // already been breached or owns server
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

		// Break ports with owned programs
		programs.forEach((program, index) => {
			if (ns.fileExists(program)) {
				programFunctions[index](server);
			}
		});

		// Get root access
		ns.nuke(server);
		ns.tprint(`Breached the gates of ${server} \n`);
		return true //breach successful

	}

	return false //breach unsuccessful

}

export async function getStats(ns, server) {
	const money = ns.getServerMaxMoney(server);
	const securityMin = ns.getServerMinSecurityLevel(server);
	const hackingLevelRequired = ns.getServerRequiredHackingLevel(server);
	const numPortOpenersRequired = ns.getServerNumPortsRequired(server);
	
	return [server, hackingLevelRequired, numPortOpenersRequired, securityMin, money];
}

export async function copyFiles(ns, server, files) {
	await ns.scp(files, server)

}

export async function killRunningScripts(ns, server) {
	ns.killall(server);
}
