import axios from 'axios';

async function getPairIndex(symbol) {
	try {
		const res = await axios.get(
			'https://fapi.binance.com/fapi/v1/premiumIndex',
			{
				params: {
					symbol: symbol,
				},
			}
		);
		return res;
	} catch (e) {
		console.error(e);
	}
}

export default {
	getPairIndex,
};
