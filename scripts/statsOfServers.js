/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Write server stats .txt output file.
 * 
 */

import { writeAsCsv } from "lib/general.js";
import { getStats, callOnServers } from "lib/servers.js";

/** @param {NS} ns **/
export async function main(ns) {

	if(!ns.args.length || !ns.args[0].endsWith(".txt")) {
		ns.tprint("Please provide args: -destinationFile.txt");	
	}
	const destinationFile = ns.args[0];

	// Get the results
    const results = await callOnServers(ns, getStats);

	// Write the results to a file
	const header = ["name", "required_hacking", "programs_needed", "security_min", "money_max"];
	await writeAsCsv(ns, destinationFile, results, header);
	ns.tprint(`Saved server stats to: "${destinationFile}"`);
	
}