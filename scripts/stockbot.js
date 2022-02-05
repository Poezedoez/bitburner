/**
 * @author Ragger Jonkers "poezedoez" <ragger@xs4all.nl>
 * 
 * Stock bot to automate trading of stocks. Requires:
 * 		- WSE access
 * 		- TIX API access
 * 
 * [WORK IN PROGRESS]
 */

 class StockTrader {

	constructor(
		ns, 
		volatilityThreshold=0.05, 
		forecastThreshold=0.55, 
		profitMargin=1.1, 
		allowance=0.10
	) {
		this._ns = ns;
		this._volatilityThreshold = volatilityThreshold;
		this._forecastThreshold = forecastThreshold;
		this._profitMargin = profitMargin;
		this._allowance = allowance;
		this._portfolio = {};
		this._stockSymbols = ns.stock.getSymbols();
		this._playerCapital = ns.getServerMoneyAvailable('home');
	}

	/**
      * @param {number} capital
      */
	set playerCapital(capital) {
		this._playerCapital = capital;
	}

	stockOwned(stock) {
		return Boolean(this._portfolio[stock]);
	}

	getOwnedValue(stock) {
		return this._portfolio[stock].shares*this._portfolio[stock].value;
	}

	shouldBuy(stock) {
		const positiveForecast = this._ns.stock.getForecast(stock) 
			>= this._forecastThreshold;
		const hasStabilized = this._ns.stock.getVolatility(stock) 
			<= this._volatilityThreshold;
		return positiveForecast && hasStabilized;
	}

	shouldSell(stock) {
		const negativeForecast = ns.stock.getForecast(stock) 
			< this._forecastThreshold;
		const reachedProfitMargin = this._ns.stock.getAskPrice(stock) 
			>= this._portfolio[stock].value*profitMargin;
		return reachedProfitMargin && negativeForecast;
	}

	buyStock(stock) {
		const stockPrice = this._ns.stock.getAskPrice(stock);
		const numShares = getNumShares(stockPrice, stock); 
		this._ns.stock.buy(stock, shares);
		this._ns.print(`BUY ${numShares} ${stock} @ ${Math.round(stockPrice)}`);
		this._portfolio[stock] = {value: stockPrice, shares: numShares};
		const investedMoney = stockPrice * numShares;

		return investedMoney
	}

	sellStock(stock) {
		const [sharesLong, ...rest] = this._ns.stock.getPosition(stock);
		this._ns.print(`SELL ${portfolio[stock].shares} ${stock} @ ${portfolio[stock].value}`);
		this._ns.stock.sell(stock, sharesLong);
		delete this._portfolio[stock];
	}

	// Calculate how many shares to buy
	getNumShares(stockPrice, stock) { 
		
		const maxSpend = playerMoney * this._allowance;
		const calcShares = maxSpend/stockPrice;
		const maxShares = this._ns.stock.getMaxShares(stock);

		return calcShares > maxShares ? maxShares : calcShares;
	}

	// Fill portfolio with owned stocks, and update player capital
	initPortfolio() {
		for(const stock of this._stockSymbols){
			let [sharesLong, averagePriceLong, sharesShort, avgeragePriceShort] = this._ns.stock.getPosition(stock);
			if(sharesLong > 0){
				portfolio[stock] = {value: averageLongPrice, shares: sharesLong};
				this._ns.print(`OWNED ${sharesLong} ${stock} @ ${averagePriceLong}`);
				this.playerCapital += sharesLong * averagePriceLong; 
			};
		};
	}



}

export async function main(ns) {

	ns.disableLog('ALL');
	ns.print("Starting stockbot...");

	// PARAMETERS
	const volatilityThreshold = 0.05; // Buy below this percentage
	const forecastThreshold = 0.55; // Sell below this percentage
	const profitMargin = 1.1; // Sell above this percentage
	const allowance = 0.20; // Maximum percentage of player money allowed to spend
	

	// Init stock trader assistant that keeps track of portfolio
	const stockTrader = new StockTrader(
		ns, 
		volatilityThreshold, 
		forecastThreshold, 
		profitMargin, 
		allowance
	);
	stockTrader.initPortfolio();

	let cycle = 0;
 	while(true){

		// Check every stock
		let portfolioValue = 0;
 		for(const stock of stockSymbols){ 

			// Check if owned
 			if (stockTrader.stockOwned(stock)) { 
				 
				// Sell if we should
 				if(stockTrader.shouldSell(stock)){ 
 					stockTrader.sellStock(stock);
 				}
				else {
					portfolioValue += stockTrader.getOwnedValue(stock);
				}
				
 			}

			// If not owned, buy if we should
 			else if (stockTrader.shouldBuy(stock)){
 				const investedMoney = buyStock(stock);
				portfolioValue += investedMoney;
 			}

 		}

		// Update player capital in order to spend accordingly
		const capital = ns.getServerMoneyAvailable('home') + portfolioValue;
		stockTrader.playerCapital = capital;

 		cycle++;
 		if (cycle % 10 === 0 && cycle > 0){ 
			 ns.print(`Completed ${cycles} cycles.`) 
		};

 		await ns.sleep(6000);

 	}


}