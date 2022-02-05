/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Kill all running scripts on all servers.
 */


 import { callOnServers, killRunningScripts } from "lib/servers.js";


 /** @param {NS} ns **/
 export async function main(ns) {
     await callOnServers(ns, killRunningScripts, [ns.getHostname()]);
     ns.tprint("Killed running scripts on all servers (except host).")
 }