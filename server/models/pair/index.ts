import Binance from 'node-binance-api';
import { PAIR, PRICE, SPIKE, orm } from '../orm';
import { createSpike } from '../spike';
import { createPrice } from '../price';
import {
	type CreatePair,
	type FindPair,
	type GetAlertSymbols,
	type GetChatPairs,
	type GetChatPairsRaw,
	type GetPairs,
	type IsAlertSymbolExist,
	type PairWithEntities,
	type UpdatePairPrice,
} from '../../../shared/models/pair';
import { type GetChatPairPrices } from '../../../shared/models/future';

const binance = new Binance();

export const findPair: FindPair = async (params, include = undefined) => {
	const res = await PAIR.findOne({
		where: {
			symbol: params.symbol,
		},
		include,
	});
	return res?.dataValues;
};

export const findPairOrCreate = async ({ symbol }: { symbol: string }): ReturnType<FindPair> => {
	try {
		return await PAIR.create({
			symbol,
		}).then((result) => result.dataValues);
	} catch {
		return await findPair({ symbol });
	}
};

export const createPair: CreatePair = async (params) => {
	const transaction = await orm.transaction();

	try {
		const pair = await findPairOrCreate({ symbol: params.symbol });

		if (!pair) {
			throw new Error('Unexpected error');
		}

		if (params.type === 'SPIKE') {
			await createSpike({
				chatId: params.chatId,
				PairId: pair.id,
			});
		} else {
			await createPrice({
				chatId: params.chatId,
				message: params.message,
				type: params.type,
				price: params.price,
				PairId: pair.id,
			});
		}

		await transaction.commit();
	} catch (error) {
		// TODO: need to propagate error after rollback
		await transaction.rollback();
	}
};

export const getPairs: GetPairs = async () => {
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
	// model was expanded with include param
	return res.map((item) => item.get({ plain: true })) as PairWithEntities[];
};

export const getChatPairs: GetChatPairs = async (params) => {
	const result = await PAIR.findAll({
		where: {
			symbol: params.symbol,
		},
		include: [
			{
				required: false,
				model: PRICE,
				as: 'prices',
				where: {
					chatId: params.chatId,
				},
			},
			{
				required: false,
				model: SPIKE,
				as: 'spikes',
				where: {
					chatId: params.chatId,
				},
			},
		],
	});
	// This model was expanded by `include` parameter
	return result.map((item) => item.get({ plain: true })) as PairWithEntities[];
};

export const updatePairPrice: UpdatePairPrice = async ({ symbol, markPrice }) => {
	await PAIR.update(
		{
			markPrice,
		},
		{
			where: {
				symbol,
			},
		}
	);
};

export const getChatPairsRaw: GetChatPairsRaw = async ({ chatId }) => {
	// TODO: rewrite query more modern
	const [result] = await orm.query(`
		SELECT pa.symbol FROM Prices p
				LEFT JOIN Trades t ON 
					p.PairId=t.PairId
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=p.PairId
			WHERE p.chatId=${chatId}
			GROUP BY p.PairId
			union
		SELECT pa.symbol FROM Trades t
				LEFT JOIN Prices p ON
					p.PairId=t.PairId
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=t.PairId
			WHERE t.chatId=${chatId}
			GROUP BY t.PairId
		UNION
		SELECT pa.symbol FROM Spikes t
				LEFT JOIN Prices p ON 
					p.PairId=t.PairId
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=t.PairId
			WHERE t.chatId=${chatId}
			GROUP BY t.PairId
	`);

	return getSymbolsFromUnknownArray(result);
};
export const getAlertSymbols: GetAlertSymbols = async ({ chatId }) => {
	const [result] = await orm.query(`
		SELECT pa.symbol FROM Prices p
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=p.PairId
			WHERE p.chatId=${chatId}
			GROUP BY p.PairId
		UNION
		SELECT pa.symbol FROM Spikes t
				LEFT JOIN Prices p ON 
					p.PairId=t.PairId
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=t.PairId
			WHERE t.chatId=${chatId}
			GROUP BY t.PairId
	`);

	return getSymbolsFromUnknownArray(result);
};

export const isAlertSymbolExist: IsAlertSymbolExist = async ({ symbol, chatId }) => {
	const [result] = await orm.query(`
		SELECT COUNT(DISTINCT pa.symbol) as cnt FROM Prices p
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=p.PairId
			WHERE p.chatId=${chatId} AND pa.symbol='${symbol}'
			GROUP BY p.PairId
		UNION
		SELECT COUNT(DISTINCT pa.symbol) FROM Spikes t
				LEFT JOIN Prices p ON 
					p.PairId=t.PairId
				LEFT JOIN Spikes s ON 
					p.PairId=s.PairId
				LEFT JOIN PAIRS pa ON pa.id=t.PairId
			WHERE t.chatId=${chatId} AND pa.symbol='${symbol}'
			GROUP BY t.PairId
	`);
	return !(result.length === 0);
};

export const getChatPairPrices: GetChatPairPrices = async ({ chatId }) => {
	const pairs = await getChatPairsRaw({ chatId });
	if (pairs.length === 0) {
		return null;
	}
	const promises = pairs.map(async (pair) => await binance.futuresMarkPrice(pair));
	const result = await Promise.all(promises);
	return result;
};

function getSymbolsFromUnknownArray(array: unknown[]): string[] {
	const symbols: string[] = [];
	array.forEach((item) => {
		if (typeof item === 'object' && item && 'symbol' in item && typeof item.symbol === 'string') {
			symbols.push(item.symbol);
		} else {
			console.log('Wrong result item', item);
		}
	});

	return symbols;
}
