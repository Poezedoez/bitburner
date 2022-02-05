/**
 * @author Ragger Jonkers "poezedoez" <ragger@xs4all.nl>
 * 
 * Assist the hacking manager by breaching servers and 
 * supplying required files.
 */

/** @param {NS} ns **/
export async function main(ns) {

	const host = ns.getHostname();

	// Collect stats of all servers
	const serversFile = "/hacking/servers.txt";
	ns.exec("/scripts/statsOfServers.js", host, 1, serversFile);
	await ns.sleep(200);

	while(true) {
		
		// Breach (new) servers
		ns.exec("/scripts/breachServers.js", host);
		await ns.sleep(200);

		// Write (new) hacking targets to a .txt file
		const targetsFile = "/hacking/targets.txt";
		ns.exec("/scripts/writeTargets.js", host, 1, serversFile, targetsFile);
		await ns.sleep(200);
		
		// Write (new) hosts to a .txt file
		const hostsFile = "/hacking/hosts.txt";
		ns.exec("/scripts/writeHosts.js", host, 1, hostsFile);
		await ns.sleep(200);

		// Copy hacking files to (new) servers
		const files = ['/scripts/weaken.js', '/scripts/hack.js', '/scripts/grow.js'];
		ns.exec("/scripts/copyToServers.js", host, 1, ...files);
		await ns.sleep(200);
		
	}

  


	
}