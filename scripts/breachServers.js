/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Breach all servers (if possible)
 */

 import { callOnServers, breach } from "lib/servers.js";

 /** @param {NS} ns **/
 export async function main(ns) {
     await callOnServers(ns, breach, ["home"], false);
 }