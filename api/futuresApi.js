import axios from 'axios';

async function getPairIndex(symbol) {
	try {
		const res = await axios.get('https://data.binance.com/api/v3/ticker', {
			params: {
				symbol: symbol,
			},
		});
		return res;
	} catch (e) {
		console.error(e);
	}
}

export default {
	getPairIndex,
};
