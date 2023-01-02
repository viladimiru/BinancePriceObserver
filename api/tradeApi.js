import { TEMP_TRADE, TRADE, PAIR } from '../repository/index.js';

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
	setTempTradeByChatId,
	deleteTempTradeByChatId,
	getTempTradeByChatId,
	createTrade,
	getChatTrades,
	removeTrade,
	isChatTradeExists,
	getChatTradesByPairs,
};
