import { PRICE, PAIR } from '../repository/index.js';
import pairApi from './pairApi.js';

async function isPriceExist(chatId, symbol, type, price) {
	const result = await pairApi.findPair(symbol).then(async (pair) => {
		return await PRICE.findOne({
			where: {
				type: type,
				chatId: chatId,
				price: price,
				PairId: pair.id,
			},
			attributes: ['id'],
		});
	});
	return !!result;
}

async function removePrice(symbol, chatId, type, price) {
	await pairApi.findPair(symbol).then(async (pair) => {
		return await PRICE.destroy({
			where: {
				chatId: chatId,
				type: type,
				price: price,
				PairId: pair.id,
			},
		});
	});
	return await pairApi.getPairs();
}
async function createPrice(chatId, message, type, price, pairId) {
	await PRICE.findOrCreate({
		where: {
			type: type,
			price: price,
			message: message,
			chatId: chatId,
			PairId: pairId,
		},
		raw: true,
		nest: true,
	});
}
async function createPriceWithSymbol(chatId, message, type, price, symbol) {
	const pair = await PAIR.findOne({
		where: {
			symbol: symbol,
		},
		raw: true,
		nest: true,
	});
	await createPrice(chatId, message, type, price, pair.id);
}

export default {
	removePrice,
	isPriceExist,
	createPrice,
	createPriceWithSymbol,
};
