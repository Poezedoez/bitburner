export async function main(ns) {

	if (!ns.args.length || ns.args.length < 2) {
		ns.tprint('use args: -killRunningScripts -script [-scriptArg1] [-scriptArg2] ...')
		ns.exit();
	}

	if (typeof ns.args[0] !== "boolean") {
		ns.tprint('use args: -killRunningScripts(true/false) -script [-scriptArg1] [-scriptArg2] ...')
		ns.exit();
	}

	let killRunningScripts = ns.args[0]; // allow update during running
	const script = ns.args[1];
	const scriptCost = await ns.getScriptRam(script);
	const scriptArgs = ns.args.slice(2).length ? ns.args.slice(2) : "";
	
	
	const programs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	const programFunctions = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject];
	let programsOwned = programs.filter(program => ns.fileExists(program)).length; // allow update during running
	let visitedServers = new Set(["home"]); // allow update during running
	let hackingLevel = await ns.getHackingLevel(); // allow update during running
	
	// GO
	await deploy();

	/** Continuously check if there are new servers to deploy scripts on */
	async function deploy() {

		let roundsDone = 0;
		let scriptsDeployed = 0;

		while (true) {

			// Start recursion for this round
			const adjacentServers = await ns.scan("home");
			await visitServers(adjacentServers);
			roundsDone += 1;
			ns.print(`Finished round ${roundsDone}. Deployed script on ${scriptsDeployed} servers this round. \n`);

			// Prepare next round
			visitedServers = new Set(["home"]);
			killRunningScripts = false; // only kill scripts first round, if opted
			scriptsDeployed = 0;
			hackingLevel = await ns.getHackingLevel();
			programsOwned = programs.filter(program => ns.fileExists(program)).length;

			// Be patient
			await ns.sleep(30000);
		}

	}


	/** Break all ports of a server */
	async function breakPorts(server) {
		programs.forEach((program, index) => {
			if (ns.fileExists(program)) {
				programFunctions[index](server);
			}
		});
	}


	/** Visit a server */
	async function visitServer(server) {

		// Get server info and requirements
		const requiredLevel = await ns.getServerRequiredHackingLevel(server);
		const hasRequiredLevel = hackingLevel >= requiredLevel;
		const requiredPortOpeners = await ns.getServerNumPortsRequired(server);
		const hasEnoughPortOpeners = programsOwned >= requiredPortOpeners;
		let deployed = false;

		if (hasRequiredLevel && hasEnoughPortOpeners) {

			if (!ns.hasRootAccess(server)) {
				ns.print(`Breaking  ports... \n`);
				await breakPorts(server);
				await ns.nuke(server);
			}

			if (killRunningScripts) {
				ns.print(`Breaking  ports... \n`);
				await ns.killall(server);
				await ns.sleep(500);
			}

			// Calculate usable threads
			const serverRamUsed = await ns.getServerUsedRam(server);
			const serverRamMax = await ns.getServerMaxRam(server);
			const serverRamAvailable = serverRamMax - serverRamUsed;
			const threads = Math.floor(serverRamAvailable / scriptCost);

			// Copy the script over
			await ns.scp(script, server);

			// Execute script on the target server
			if (threads > 0) {
				await ns.exec(script, server, threads, ...scriptArgs);
				deployed = true;
				const message = `Script (${scriptCost} GB RAM) deployed on ${threads} threads on ${server}. \n`;
				ns.print(message);
				ns.tprint(message);
			}
		}

		visitedServers.add(server);
		return deployed;
	}

	/** Recursively traverse all servers */
	async function visitServers(servers) {

		// Base case
		if (!servers.length) {
			return
		}

		// Grab the first server and visit it if we haven't already
		const nextServer = servers.shift();
		if (!visitedServers.has(nextServer)) {
			const deployment = await visitServer(nextServer);
			if (deployment) scriptsDeployed += 1;
			const adjacentServers = await ns.scan(nextServer);

			// Go deeper into the recursion
			await visitServers(adjacentServers);
		}

		// Finish visiting the rest of the servers (besides the first)
		await visitServers(servers);

	}

}