import { TRADE, PAIR } from '../repository/index.js';
import pairApi from './pairApi.js';

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
	return await pairApi.findPair(symbol).then(async (pair) => {
		await TRADE.destroy({
			where: {
				chatId: chatId,
				type: type,
				markPrice: price,
				PairId: pair.id
			},
		});
	})
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
	createTrade,
	getChatTrades,
	removeTrade,
	isChatTradeExists,
	getChatTradesByPairs,
};
