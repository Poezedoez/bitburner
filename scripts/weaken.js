/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * Weaken a target server.
 */

/** @param {NS} ns **/
export async function main(ns) {
	
	if (!ns.args.length) {
		ns.tprint('please provide arg: -target')
		ns.exit();
	}

	await ns.weaken(ns.args[0]);
}