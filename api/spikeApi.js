import { SPIKE, PAIR } from '../repository/index.js';
import pairApi from './pairApi.js';

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

async function createSpike(chatId, pairId) {
	return await SPIKE.findOrCreate({
		where: {
			chatId: chatId,
			PairId: pairId,
		},
		raw: true,
		nest: true,
	});
}

async function createSpikeWithSymbol(chatId, symbol) {
	const pair = await PAIR.findOne({
		where: {
			symbol: symbol,
		},
		raw: true,
		nest: true,
	});
	return await createSpike(chatId, pair.id);
}

async function removeSpike(symbol, chatId) {
	await pairApi.findPair(symbol).then(async (pair) => {
		return await SPIKE.destroy({
			where: {
				chatId: chatId,
				PairId: pair.id,
			},
		});
	});
	return await pairApi.getPairs();
}

async function isSpikeExist(symbol, chatId) {
	const result = await pairApi.findPair(symbol).then(async (pair) => {
		return await SPIKE.findOne({
			where: {
				chatId: chatId,
				PairId: pair.id,
			},
			attributes: ['id'],
		});
	});
	return !!result;
}

export default {
	getSpikePairs,
	removeSpike,
	isSpikeExist,
	removeSpike,
	createSpike,
	createSpikeWithSymbol,
};
