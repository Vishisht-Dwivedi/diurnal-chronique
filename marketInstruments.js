const url = "https://data-api.cryptocompare.com/index/cc/v1/markets/instruments";
async function getMarkets() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return Object.keys(json['Data']);
    } catch (error) {
        console.error(error.message);
    }
}
async function getInstruments(marketName) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return Object.keys(json['Data'][marketName]['instruments']);
    } catch (error) {
        console.error(error.message);
    }
}
const info = {
    url,
    marketNames: getMarkets,
    instruments: getInstruments
}
module.exports = info;