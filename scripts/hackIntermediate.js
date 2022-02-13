/**
 * @author Ragger Jonkers <ragger@xs4all.nl>
 * 
 * Use the host server as a hacking manager to distribute 
 * the exact amount of threads needed over all available hosts 
 * to either grow / weaken or hack target servers. 
 * 
 * No batch parallelization is used.
 * 
 * Dependent on:
 * 		- writeHosts.txt
 * 		- writeTargets.txt
 * 
 */

 import { HackAction, HackManager } from 'lib/hacking.js'

 /** @param {NS} ns **/
 export async function main(ns) {
 
     const manager = new HackManager(ns);
     const getRamAvailable = host => ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
     const homeReservedRam = ns.getServerMaxRam("home")*0.25;
 
     ns.tprint('Starting hacking loop...');
     
     while(true) {
 
         // Get targets and thresholds
         const [thresholds, targets, hosts] = await Promise.all([
             manager.getThresholds(),
             manager.getTargets(),
             manager.getHosts()
         ]);
 
         // Loop over hosts
         for await (const host of hosts) {
             
             // Loop over targets
             for await (const target of targets) {
 
                 // Analyze what action needs to be applied to target server(s)
                 const moneyThreshold = ns.getServerMaxMoney(target) * thresholds.money;
                 const securityThreshold = ns.getServerMinSecurityLevel(target) + thresholds.security;
                 let action;
                 if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
                     action = HackAction.Grow;
                 }
                 else if (ns.getServerSecurityLevel(target) > securityThreshold) {
                     action = HackAction.Weaken;
                 } else {
                     action = HackAction.Hack;
                 }
 
                 // Get available server ram for host, and calculate threads
                 let serverRam = getRamAvailable(host);
                 if(host === "home") {
                     serverRam = Math.max(serverRam-homeReservedRam, 0);
                 }
                 const scriptCost = await action.getScriptCost(ns);
                 const threadsAvailable = Math.floor(serverRam / scriptCost);
                 
                 if(threadsAvailable === 0) {
                     break; // next host
                 }
 
                 // Calculate how many threads are needed for the desired action
                 const calculation = await action.calculate(ns, target)
                 const scheduledActions = await manager.getActionSchedule(action, target);
                 let threadsAssigned = 0;
                 scheduledActions.forEach(row => threadsAssigned += row[1]);
                 const threadsNeeded = calculation.threads - threadsAssigned;
 
                 
 
                 if(threadsNeeded <= 1) {
                     continue; // next target
                 }
 
                 const threadsToDeploy = Math.round(Math.min(threadsNeeded, threadsAvailable));
 
                 ns.print(`${host} performing ${action.name} on ${target} with ${threadsToDeploy}/${threadsNeeded} threads.`)
 
                 // Execute action
                 await action.execute(ns, host, target, threadsToDeploy)
 
                 // Log action
                 await manager.scheduleAction(action, target, threadsToDeploy, calculation.time); 
             }
         }
 
         await ns.sleep(10000);
 
     }
 
 
 }
