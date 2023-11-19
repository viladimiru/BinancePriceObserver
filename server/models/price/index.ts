import {
	type CreatePrice,
	type CreatePriceWithSymbol,
	type IsPriceExist,
	type RemovePrice,
} from '../../../shared/models/price';
import { PRICE } from '../orm';
import { findPair, getPairs } from '../pair';

export const isPriceExist: IsPriceExist = async ({ chatId, symbol, type, price }) => {
	const result = await findPair({ symbol }).then(async (pair) => {
		if (!pair) {
			throw new Error('pair not found');
		}
		return await PRICE.findOne({
			where: {
				type,
				chatId,
				price,
				PairId: pair.id,
			},
			attributes: ['id'],
		});
	});
	return !!result;
};

export const removePrice: RemovePrice = async (params) => {
	await findPair({
		symbol: params.symbol,
	}).then(async (pair) => {
		if (!pair) {
			throw new Error('pair not found');
		}
		await PRICE.destroy({
			where: {
				chatId: params.chatId,
				type: params.type,
				price: params.price,
				PairId: pair.id,
			},
		});
	});
	return await getPairs();
};

export const createPrice: CreatePrice = async ({ chatId, message, type, price, PairId }) => {
	await PRICE.findOrCreate({
		where: {
			type,
			price,
			message,
			chatId,
			PairId,
		},
		raw: true,
		nest: true,
	});
};
export const createPriceWithSymbol: CreatePriceWithSymbol = async ({
	chatId,
	message,
	type,
	price,
	symbol,
}) => {
	// TODO: create separate method because its duplicate function
	const pair = await findPair({ symbol });
	if (!pair) {
		throw new Error('pair not found');
	}

	await createPrice({
		chatId,
		message,
		type,
		price,
		PairId: pair.id,
	});
};
