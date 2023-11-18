import { PAIR, PRICE, SPIKE, orm } from '../orm/index';
import { createPair, getPairs } from '.';
import { describe, test, expect, beforeAll } from '@jest/globals';
import type { CreatePairParams } from '../../../shared/models/pair';
import lodash from 'lodash';
import { type PairEntity } from '../../../shared/models/orm/entities/pair';
import { v4 as uuidv4 } from 'uuid'

beforeAll(async () => {
	await new Promise((resolve) => {
		orm.afterSync('ready', resolve);
	})
})

describe('pair model', () => {
	const getCreatePairParams = (type: CreatePairParams['type'], symbol: string): CreatePairParams => ({
		type,
		chatId: 123123,
		message: 'text',
		symbol,
		price: 34124,
	})

	test('create pair with price', async () => {
		const pair = getCreatePairParams('PRICE', uuidv4());
		await createPair(pair);

		const currentPair = await getPair(pair.symbol);

		const currentPrice = await PRICE.findOne({
				where: {
					PairId: currentPair?.id,
				}
			})

		expect(currentPair).toMatchObject({
			symbol: pair.symbol,
		});

		expect(currentPrice).toMatchObject(lodash.omit(pair, ['symbol']));
	})

	test('create pair with spike', async () => {
		const pair = getCreatePairParams('SPIKE', uuidv4());
		await createPair(pair);

		const currentPair = await getPair(pair.symbol)

		const currentSpike = await SPIKE.findOne({
			where: {
				PairId: currentPair?.id
			}
		}).then((result) => result?.dataValues);

		expect(currentPair).toMatchObject({
			symbol: pair.symbol,
		})

		expect(currentSpike).toMatchObject({
			PairId: currentPair?.id,
			chatId: pair.chatId,
		})
	})

	test('get pairs with child entities', async () => {
		const symbol = uuidv4();
		const pairWithPrice = getCreatePairParams('PRICE', symbol);
		const pairWithSpike = getCreatePairParams('SPIKE', symbol)

		await Promise.all([
			createPair(pairWithPrice),
			createPair(pairWithSpike),
		])

		const result = await getPairs();
		const createdPair = result.find((pair) => pair.symbol === symbol);

		expect(createdPair).toBeTruthy();

		const isPriceCreated = createdPair?.prices.some((price) => price.PairId === createdPair.id);
		const isSpikeCreated = createdPair?.spikes.some((price) => price.PairId === createdPair.id);

		expect(isPriceCreated).toBeTruthy()
		expect(isSpikeCreated).toBeTruthy()
	})
})

async function getPair(symbol: string): Promise<PairEntity | undefined> {
	return await PAIR.findOne({
		where: {
			symbol,
		}
	}).then((result) => result?.dataValues);
}
