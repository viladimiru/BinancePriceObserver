import { PAIR, TEMP_PAIR, TRIGGER, PRICE } from '../sequelize.js';
import sequelize from 'sequelize';

async function updateTempPairByChatId(data, chatId) {
	return await TEMP_PAIR.update(data, {
		where: {
			chatId: chatId,
		},
	});
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
	const [pair, isPairCreated] = await PAIR.findOrCreate({
		where: {
			symbol: data.symbol,
		},
		raw: true,
		nest: true,
	});
	const [trigger, isTriggerCreated] = await TRIGGER.findOrCreate({
		where: {
			chatId: data.chatId,
			PairId: pair.id,
		},
		raw: true,
		nest: true,
	});
	const [_, isPriceCreated] = await PRICE.findOrCreate({
		where: {
			type: data.type,
			price: data.price,
			message: data.message,
			TriggerId: trigger.id,
		},
		raw: true,
		nest: true,
	});
}

async function removePair(symbol, chatId, type, price) {
	const result = await PAIR.findOne({
		where: {
			symbol: symbol,
		},
		include: {
			model: TRIGGER,
			as: 'triggers',
			attributes: [],
			include: {
				model: PRICE,
				as: 'prices',
				attributes: [],
			},
		},
		attributes: [
			'symbol',
			[sequelize.fn('COUNT', sequelize.col('triggers.id')), 'totalTriggers'],
			[
				sequelize.fn('COUNT', sequelize.col('triggers.prices.id')),
				'totalPrices',
			],
		],
		group: ['Pair.id'],
		raw: true,
	});
	if (result.totalTriggers === 1 && result.totalPrices === 1) {
		await PAIR.destroy({
			where: {
				symbol: symbol,
			},
		});
	} else if (result.totalPrices === 1) {
		await TRIGGER.destroy({
			where: {
				chatId: chatId,
			},
		});
	} else {
		await PRICE.destroy({
			where: {
				type: type,
				price: price,
			},
		});
	}
	return await getPairs();
}

async function getPairs() {
	const res = await PAIR.findAll({
		include: {
			model: TRIGGER,
			as: 'triggers',
			include: {
				model: PRICE,
				as: 'prices',
			},
		},
	});
	return res.map((item) => item.get({ plain: true }));
}

async function getChatPairs(chatId) {
	const res = await PAIR.findAll({
		include: {
			model: TRIGGER,
			as: 'triggers',
			where: {
				chatId: chatId,
			},
			include: {
				model: PRICE,
				as: 'prices',
			},
		},
	});
	return res.map((item) => item.get({ plain: true }));
}

async function isChatPairExists(chatId, symbol, type, price) {
	try {
		const res = await PAIR.findOne({
			where: {
				symbol: symbol,
			},
			include: {
				model: TRIGGER,
				as: 'triggers',
				attribute: [],
				where: {
					chatId: chatId,
				},
				include: {
					model: PRICE,
					as: 'prices',
					attribute: [],
					where: {
						type: type,
						price: price,
					},
				},
			},
			attributes: [],
		});
		return !!res;
	} catch {
		return false;
	}
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
};
