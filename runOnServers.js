import { applyToServers, breachServer } from "lib.js";

/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 */

/** @param {NS} ns **/
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
	const scriptCost = ns.getScriptRam(script);
	const scriptArgs = ns.args.slice(2).length ? ns.args.slice(2) : "";

	await applyToServers(ns, runOnServer, ["home"], true);
	ns.tprint("Finished script.")


	// Function to run on all servers (serverFunction)
	async function runOnServer(server) {

		// First breach the server (get root access)
		const hasRootAccess = await breachServer(ns, server);
		if(!hasRootAccess) {
			return 
		}

		// Kill running scripts if opted in args
		if (killRunningScripts) {
			ns.print(`Killing running scripts... \n`);
			ns.killall(server);
		}

		// Copy (hacking) script over
		await ns.scp(script, server);

		// Calculate usable threads
		const serverRamUsed = ns.getServerUsedRam(server);
		const serverRamMax = ns.getServerMaxRam(server);
		const serverRamAvailable = serverRamMax - serverRamUsed;
		const threads = Math.floor(serverRamAvailable / scriptCost);

		// Execute script on the target server
		if (threads > 0) {
			ns.exec(script, server, threads, ...scriptArgs);
			const message = `Script (${scriptCost} GB RAM) deployed on ${threads} threads on ${server}. \n`;
			ns.print(message);
			ns.tprint(message);
		}
	}

}