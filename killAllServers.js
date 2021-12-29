import { applyToServers } from "lib.js";

/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 */

/** @param {NS} ns **/
export async function main(ns) {
	const killServer = async server => ns.killall(server); // serverFunction
    await applyToServers(ns, killServer, ["home"]);
	ns.tprint("Finished script.")
}