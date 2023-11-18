import { Op } from 'sequelize';
import {
	type CreateTrade,
	type GetChatTrades,
	type GetChatTradesByPairs,
	type IsChatTradeExist,
	type RemoveTrade,
} from '../../../shared/models/trade';
import { TRADE, PAIR, orm } from '../orm';
import { findPair, findPairOrCreate } from '../pair';

export const createTrade: CreateTrade = async ({
	symbol,
	type,
	markPrice,
	chatId,
	shoulder,
}) => {
	const transaction = await orm.transaction();
	try {
		const pair = await findPairOrCreate({ symbol });

		if (!pair) {
			throw new Error('Unexpected error');
		}

		await TRADE.findOrCreate({
			where: {
				type,
				markPrice,
				chatId,
				shoulder,
				PairId: pair.id,
			},
			raw: true,
			nest: true,
		});

		await transaction.commit();
	} catch (error) {
		await transaction.rollback();
	}
};

export const getChatTrades: GetChatTrades = async ({ chatId }) => {
	const result = await PAIR.findAll({
		include: {
			required: false,
			model: TRADE,
			as: 'trades',
			where: {
				chatId,
			},
		},
	});

	return result.map((item) => item.dataValues) as Awaited<
		ReturnType<GetChatTrades>
	>;
};

export const removeTrade: RemoveTrade = async ({
	symbol,
	chatId,
	type,
	markPrice,
}) => {
	await findPair({ symbol }).then(async (pair) => {
		if (!pair) {
			throw new Error('pair not found');
		}

		await TRADE.destroy({
			where: {
				chatId,
				type,
				markPrice,
				PairId: pair.id,
			},
		});
	});
};

export const isChatTradeExist: IsChatTradeExist = async ({
	chatId,
	symbol,
	type,
	markPrice,
}) => {
	return await findPair(
		{ symbol },
		{
			model: TRADE,
			as: 'trades',
			where: {
				chatId,
				type,
				markPrice,
			},
		}
	).then(Boolean);
};

export const getChatTradesByPairs: GetChatTradesByPairs = async ({ pairs }) => {
	const result = await TRADE.findAll({
		include: {
			model: PAIR,
			attributes: ['symbol'],
			where: {
				symbol: {
					[Op.in]: pairs,
				},
			},
		},
		raw: true,
		nest: true,
	});

	return result.map((item) => item.dataValues) as Awaited<
		ReturnType<GetChatTradesByPairs>
	>;
};
