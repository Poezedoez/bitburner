/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Write (root) accessible hosts to a .txt output file
 * 
 */

 import { writeAsCsv } from "lib/general.js"; 
 import { callOnServers } from "lib/servers.js";
 
 /** @param {NS} ns **/
 export async function main(ns) {
 
 
     // Parse args
     if(!ns.args.length) {
         ns.tprint("Please provide args: -outputFile");
         ns.exit();
     }
     
     const outputFile = ns.args[0];
 
     const checkRootAccess = (ns, server) => {
         return [server, ns.hasRootAccess(server)]
     }
     const results = await callOnServers(ns, checkRootAccess);
     const hosts = [];
     results.forEach(result => {
         const [server, hasRootAccess] = result
         if(hasRootAccess) {
             hosts.push([server]);
         }
     })
 
     await writeAsCsv(ns, outputFile, hosts);
 
     
 
 
 }