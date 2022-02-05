import { readCsv, filterData2D } from 'lib/general.js';

async function calculateHack(ns, target) {

	const calculation = {};

	// First determine how much money we want to add
	const desiredMoney = 0; // steal everything
	const currentMoney = ns.getServerMoneyAvailable(target);
	const moneyDifference = currentMoney - desiredMoney;

	calculation.threads = ns.hackAnalyzeThreads(target, moneyDifference);
	calculation.time = ns.getHackTime(target)

	return calculation
}

async function calculateGrow(ns, target) {

	const calculation = {};

	// First determine the growRatio
	const desiredMoney = ns.getServerMaxMoney(target); // grow to full
	const currentMoney = ns.getServerMoneyAvailable(target) || 1;
	const growRatio = Math.max(desiredMoney / currentMoney, 1);

	calculation.threads = ns.growthAnalyze(target, growRatio);
	calculation.time = ns.getGrowTime(target);

	return calculation
}


async function calculateWeaken(ns, target) {

	const calculation = {};

	// First determine the security levels we want to remove
	const desiredSecurityLevel = await ns.getServerMinSecurityLevel(target); // weaken to lowest
	const currentSecurityLevel = await ns.getServerSecurityLevel(target);
	const securityDifference = currentSecurityLevel - desiredSecurityLevel;

	// Find the right number of threads
	let threads = 1;
	while (ns.weakenAnalyze(threads * 2) <= securityDifference) {
		threads *= 2;
	}

	calculation.threads = threads;
	calculation.time = ns.getWeakenTime(target);

	return calculation
}

export class HackAction {

	static Hack = new HackAction("hack", calculateHack, "/scripts/hack.js");
	static Grow = new HackAction("grow", calculateGrow, "/scripts/grow.js");
	static Weaken = new HackAction("weaken", calculateWeaken, "/scripts/weaken.js");

	constructor(name, fCalculate, script) {
		this._name = name;
		this._fCalculate = fCalculate;
		this._script = script;
		
	}

	get name() {
		return this._name;
	}

	async calculate(ns, target) {
		return this._fCalculate(ns, target);
	}

	async execute(ns, host, target, threads) {
		console.log(`executing ... ${this._script}, ${host}, ${threads}, ${target}`)
		ns.exec(this._script, host, threads, target);
	}

	async getScriptCost(ns) {
		return ns.getScriptRam(this._script);
	}

	

}

export class HackManager {

	constructor(
		ns, 
		targetsFile = "/hacking/targets.txt", 
		hostsFile = "/hacking/hosts.txt"
	) {
		this._ns = ns;
		this._targetsFile = targetsFile;
		this._hostsFile = hostsFile;
		this._schedule = {};
	}

	async getHosts() {
		let hosts = await readCsv(this._ns, this._hostsFile);
		hosts = hosts.map(row => row[0]).filter(value => value !== "");

		return hosts;	
	}


	async getTargets() {
		let targets = await readCsv(this._ns, this._targetsFile);
		targets = targets.map(row => row[0]).filter(value => value !== "");

		return targets;
	}


	async getThresholds() {

		// Set default thresholds
		const thresholds = {
			money: 0.9,
			security: 5
		};

		return thresholds
	}

	async complementSchedule_(target, action) {
		if(!this._schedule[target]) {
			this._schedule[target] = {}
		}

		if(!this._schedule[target][action.name]) {
			this._schedule[target][action.name] = []
		}
	}

	async getActionSchedule(action, target) {
		
		await this.complementSchedule_(target, action);

		let actionSchedule = this._schedule[target][action.name];

		// Remove finished actions from schedule
		const filterQuery = {0: value => value >= new Date().getTime()}
		actionSchedule = await filterData2D(actionSchedule, filterQuery);

		// If all scheduled actions are finished, clear schedule history
		if(!actionSchedule.length) {
			this._schedule[target][action.name] = []
		}

		return actionSchedule;

	}

	async scheduleAction(action, target, threads, duration) {
		await this.complementSchedule_(target, action);
		const endTime = new Date().getTime()+duration;
		this._schedule[target][action.name].push([endTime, threads]);
	}
}