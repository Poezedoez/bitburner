/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Run this script in the beginning on Home server (min. 32GB RAM)
 * It:
 * 		- Purchases Hacknet nodes and upgrades
 * 		- Purchases new servers
 * 		- Hacks servers using all available hosts
 */

/** @param {NS} ns **/
export async function main(ns) {

	const host = ns.getHostname();

	// Kill all running scripts on all servers (except the host)
	ns.exec("/scripts/killAllServers.js", host);
	await ns.sleep(1000);

	// Start hacknet purchasing loop
	ns.exec("/scripts/hacknet.js", host);
	await ns.sleep(1000);

	// Start a server purchasing loop
	const serverNamePrefix = "poezedoez";
	ns.exec("/scripts/purchaseServers.js", host, 1, serverNamePrefix);
	await ns.sleep(1000);

	// Launch hacking assistant for copying files and tracking hosts / targets
	ns.exec("/scripts/assistHacking.js", host);
	await ns.sleep(1000);

	// Start a hacking loop
	ns.exec("/scripts/hackIntermediate.js", host);
	await ns.sleep(1000);

}