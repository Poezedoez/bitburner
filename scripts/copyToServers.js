/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * Copy files (script arguments) to all servers
 */

 import { copyFiles, callOnServers } from "lib/servers.js";

 /** @param {NS} ns **/
 export async function main(ns) {
 
     if (!ns.args.length) {
         ns.tprint('use args: -file [-files]')
         ns.exit();
     }
     
     const files = [...ns.args].filter(arg => arg !== undefined);
     await callOnServers(ns, copyFiles, ["home"], false, files);
 
 
 }