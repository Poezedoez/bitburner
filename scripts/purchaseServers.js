/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Purchase servers (or upgrade existing servers).
 * Assumes no other servers exist other than serverNamePrefix.
 */

/** @param {NS} ns **/
export async function main(ns) {

	if(!ns.args.length) {
		ns.tprint(`Please provide arg: -serverNamePrefix`);
		ns.exit();
	}

	const maxServers = ns.getPurchasedServerLimit();
	const maxSize = ns.getPurchasedServerMaxRam();
	const serverNamePrefix = ns.args[0];

	const purchaseServers = async money => {

		let continuePurchasing = true;

		// Check ram size of current servers
		let currentSize = 0;
		const serverZero = `${serverNamePrefix}-0`;
		try {
			currentSize = ns.getServerMaxRam(serverZero);
		}
		catch(e) {
			ns.print("No servers owned currently.");
		}

		// Determine the ram size to upgrade to (only upgrade all at once)
		let ram = 1;
		while (ram * 2 <= maxSize && ns.getPurchasedServerCost(ram * 2) < (money / maxServers)) {
			ram *= 2;
		}

		// If we can afford an upgrade, replace servers
		if(ram === maxSize) {
			ns.tprint(`Servers upgraded to max size (${currentSize}GB).`);
			continuePurchasing = false;
		}
		else if (ram > currentSize && ram > 1) { {
			ns.tprint(`Upgrading to ${ram}GB RAM servers.`)
			for (let i = 0; i < maxServers; i++) {
				const serverName = `${serverNamePrefix}-${i}`;
				if (ns.serverExists(serverName)) {
					ns.killall(serverName);
					ns.deleteServer(serverName);
				}
				ns.purchaseServer(serverName, ram);
			}
		}

		return continuePurchasing;

	};


	// Keep purchasing servers until we reach max
	let continuePurchasing = true;
	let myMoney = ns.getPlayer().money;
	while(continuePurchasing) {

		// Attempt to purchase/upgrade servers
		continuePurchasing = await purchaseServers(myMoney);

		// Update player money
		myMoney = ns.getPlayer().money;

		// Be a little patient
		await ns.sleep(10000);
	}


    

}