import axios from 'axios';

async function getPairIndex(symbol) {
	try {
		console.log('1');
		const res = await axios.get('https://data.binance.com/api/v3/ticker', {
			params: {
				symbol: symbol,
			},
		});
		console.log('2', res);
		return res;
	} catch (e) {
		console.error(e);
	}
}

export default {
	getPairIndex,
};
