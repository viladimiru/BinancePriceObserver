import {
	PAIR,
	TEMP_PAIR,
	PRICE,
	SPIKE,
	TEMP_TRADE,
	TRADE,
} from '../sequelize.js';
import Binance from 'node-binance-api';

const binance = new Binance();

async function updateTempPairByChatId(data, chatId) {
	const result = await TEMP_PAIR.update(data, {
		where: {
			chatId: chatId,
		},
	});
	return result;
}

async function setTempPairByChatId(data, chatId) {
	return await TEMP_PAIR.findOne({
		where: {
			chatId: chatId,
		},
	}).then(function (result) {
		if (result) {
			return result.update(data, {
				where: {
					chatId: chatId,
				},
			});
		}
		return TEMP_PAIR.create(data);
	});
}

async function deleteTempPairByChatId(chatId) {
	return await TEMP_PAIR.destroy({
		where: {
			chatId: chatId,
		},
	});
}

async function getTempPairByChatId(chatId) {
	return await TEMP_PAIR.findOne({
		where: {
			chatId: chatId,
		},
		raw: true,
		nest: true,
	});
}

async function createPair(data) {
	let [pair, isCreated] = await PAIR.findOrCreate({
		where: {
			symbol: data.symbol,
		},
		raw: true,
		nest: true,
	});
	if (isCreated) {
		pair = pair.dataValues;
	}
	if (data.type === 'SPIKE') {
		await SPIKE.findOrCreate({
			where: {
				chatId: data.chatId,
				PairId: pair.id,
			},
			raw: true,
			nest: true,
		});
	} else {
		const [_, istr] = await PRICE.findOrCreate({
			where: {
				type: data.type,
				price: data.price,
				message: data.message,
				chatId: data.chatId,
				PairId: pair.id,
			},
			raw: true,
			nest: true,
		});
	}
}

async function removePair(symbol, chatId, type, price) {
	try {
		if (!type) {
			SPIKE.destroy({
				where: {
					chatId: chatId,
				},
				include: {
					model: PAIR,
				},
			});
		} else {
			PRICE.destroy({
				where: {
					type: type,
					price: price,
					chatId: chatId,
				},
			});
		}
		return await getPairs();
	} catch (e) {
		console.log(e);
	}
}

async function getPairs() {
	const res = await PAIR.findAll({
		include: [
			{
				model: PRICE,
				as: 'prices',
			},
			{
				model: SPIKE,
				as: 'spikes',
			},
		],
	});
	return res.map((item) => item.get({ plain: true }));
}

async function getChatPairs(chatId) {
	const result = await PAIR.findAll({
		include: [
			{
				required: false,
				model: PRICE,
				as: 'prices',
				where: {
					chatId: chatId,
				},
			},
			{
				required: false,
				model: SPIKE,
				as: 'spikes',
				where: {
					chatId: chatId,
				},
			},
		],
	});
	return result.map((item) => item.get({ plane: true }));
}

async function isChatPairExists(chatId, symbol, type, price) {
	if (!type) {
		return !!(await PAIR.findOne({
			where: {
				symbol: symbol,
			},
			include: {
				model: SPIKE,
				as: 'spikes',
				where: {
					chatId: chatId,
				},
			},
		}));
	} else {
		return !!(await PAIR.findOne({
			where: {
				symbol: symbol,
			},
			include: {
				model: PRICE,
				as: 'prices',
				where: {
					chatId: chatId,
					type: type,
					price: price,
				},
			},
		}));
	}
}

async function updatePairPrice(symbol, markPrice) {
	await PAIR.update(
		{
			markPrice: markPrice,
		},
		{
			where: {
				symbol: symbol,
			},
		}
	);
}

async function getChatPairsRaw(chatId) {
	let result = await PAIR.findAll({
		include: [
			{
				model: PRICE,
				as: 'prices',
				where: {
					chatId: chatId,
				},
				required: false,
			},
			{
				model: TRADE,
				as: 'trades',
				where: {
					chatId: chatId,
				},
				required: false,
			}
		],
		group: ['symbol'],
		attributes: ['symbol'],
	});
	result = result.map((item) => item.get({ plain: true }));
	if (Array.isArray(result) && result.length) {
		result = result
			.filter((item) => item.prices?.length || item.trades?.length)
			.map((item) => (item = item.symbol));
	}
	return result;
}

async function getChatPairPrices(chatId) {
	const pairs = await getChatPairsRaw(chatId);
	if (pairs.length === 0) {
		return null;
	}
	const promises = pairs.map((pair) => binance.futuresMarkPrice(pair));
	const result = await Promise.all(promises);
	return result;
}

async function getSpikePairs(symbol) {
	const result = await SPIKE.findAll({
		include: {
			model: PAIR,
			where: {
				symbol: symbol,
			},
			attributes: [],
		},
	});
	return result.map((item) => item.get({ plain: true }));
}

async function setTempTradeByChatId(data, chatId) {
	return await TEMP_TRADE.findOne({
		where: {
			chatId: chatId,
		},
	}).then(function (result) {
		if (result) {
			return result.update(data, {
				where: {
					chatId: chatId,
				},
			});
		}
		return TEMP_TRADE.create(data);
	});
}

async function deleteTempTradeByChatId(chatId) {
	return await TEMP_TRADE.destroy({
		where: {
			chatId: chatId,
		},
	});
}

async function getTempTradeByChatId(chatId) {
	return await TEMP_TRADE.findOne({
		where: {
			chatId: chatId,
		},
		raw: true,
		nest: true,
	});
}

async function createTrade(data) {
	let [pair, isCreated] = await PAIR.findOrCreate({
		where: {
			symbol: data.symbol,
		},
		raw: true,
		nest: true,
	});
	if (isCreated) {
		pair = pair.dataValues;
	}
	const [_, istr] = await TRADE.findOrCreate({
		where: {
			type: data.type,
			markPrice: data.markPrice,
			chatId: data.chatId,
			shoulder: data.shoulder,
			PairId: pair.id,
		},
		raw: true,
		nest: true,
	});
}

async function getChatTrades(chatId) {
	const result = await PAIR.findAll({
		include: {
			required: false,
			model: TRADE,
			as: 'trades',
			where: {
				chatId: chatId,
			},
		},
	});
	return result.map((item) => item.get({ plane: true }));
}

async function removeTrade(symbol, chatId, type, price) {
	await TRADE.destroy({
		where: {
			chatId: chatId,
			type: type,
			markPrice: price,
		},
		include: {
			model: PAIR,
			where: {
				symbol: symbol,
			},
		},
	});
}

async function isChatTradeExists(chatId, symbol, type, price) {
	return !!(await PAIR.findOne({
		where: {
			symbol: symbol,
		},
		include: {
			model: TRADE,
			as: 'trades',
			where: {
				chatId: chatId,
				type: type,
				markPrice: price,
			},
		},
	}));
}

async function getChatTradesByPairs(pairs) {
	return await TRADE.findAll({
		include: {
			model: PAIR,
			attributes: ['symbol'],
			where: {
				symbol: pairs,
			},
		},
		raw: true,
		nest: true,
	});
}

export default {
	updateTempPairByChatId,
	setTempPairByChatId,
	deleteTempPairByChatId,
	getTempPairByChatId,
	createPair,
	removePair,
	getPairs,
	getChatPairs,
	isChatPairExists,
	updatePairPrice,
	getChatPairsRaw,
	getChatPairPrices,
	getSpikePairs,
	setTempTradeByChatId,
	deleteTempTradeByChatId,
	getTempTradeByChatId,
	createTrade,
	getChatTrades,
	removeTrade,
	isChatTradeExists,
	getChatTradesByPairs,
};
