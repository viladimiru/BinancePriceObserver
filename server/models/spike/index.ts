import {
	type CreateSpike,
	type CreateSpikeWithSymbol,
	type GetSpikePairs,
	type IsSpikeExist,
	type RemoveSpike,
} from '../../../shared/models/spike';
import { SPIKE, PAIR, USER } from '../orm';
import { findPair, getPairs } from '../pair';

export const getSpikePairs: GetSpikePairs = async ({ symbol }) => {
	const result = await SPIKE.findAll({
		include: [
			{
				model: PAIR,
				where: {
					symbol,
				},
				attributes: [],
			},
			{
				model: USER,
			},
		],
	});

	// we merged other models with include parameter
	return result.map((item) => item.dataValues) as Awaited<ReturnType<GetSpikePairs>>;
};

export const createSpike: CreateSpike = async ({ chatId, PairId }) => {
	await SPIKE.findOrCreate({
		where: {
			chatId,
			PairId,
		},
		raw: true,
		nest: true,
	});
};

export const createSpikeWithSymbol: CreateSpikeWithSymbol = async ({ chatId, symbol }) => {
	const pair = await findPair({ symbol });

	if (!pair) {
		throw new Error('pair creation error');
	}

	await createSpike({ chatId, PairId: pair.id });
};

export const removeSpike: RemoveSpike = async ({ symbol, chatId }) => {
	await findPair({ symbol }).then(async (pair) => {
		if (!pair) {
			throw new Error('pair not foud');
		}

		await SPIKE.destroy({
			where: {
				chatId,
				PairId: pair.id,
			},
		});
	});

	return await getPairs();
};

export const isSpikeExist: IsSpikeExist = async ({ symbol, chatId }) => {
	const result = await findPair({ symbol }).then(async (pair) => {
		if (!pair) {
			throw new Error('pair not found');
		}

		return await SPIKE.findOne({
			where: {
				chatId,
				PairId: pair.id,
			},
			attributes: ['id'],
		});
	});

	return !!result;
};
