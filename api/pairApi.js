import {
	PAIR,
	PRICE,
	SPIKE,
	sequelize,
} from '../repository/index.js';
import Binance from 'node-binance-api';
import priceApi from './priceApi.js';
import spikeApi from './spikeApi.js';

const binance = new Binance();

async function findPair(symbol) {
	return await PAIR.findOne({
		where: {
			symbol: symbol,
		},
		raw: true,
	});
}

async function createPair(data) {
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
	if (data.type === 'SPIKE') {
		await spikeApi.createSpike(data.chatId, pair.id);
	} else {
		await priceApi.createPrice(
			data.chatId,
			data.message,
			data.type,
			data.price,
			pair.id
		);
	}
}

async function getPairs() {
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
	return res.map((item) => item.get({ plain: true }));
}

async function getChatPairs(chatId, symbol) {
	const result = await PAIR.findAll({
		where: {
			symbol: symbol
		},
		include: [
			{
				required: false,
				model: PRICE,
				as: 'prices',
				where: {
					chatId: chatId,
				},
			},
			{
				required: false,
				model: SPIKE,
				as: 'spikes',
				where: {
					chatId: chatId,
				},
			},
		],
	});
	return result.map((item) => item.get({ plane: true }));
}

async function updatePairPrice(symbol, markPrice) {
	await PAIR.update(
		{
			markPrice: markPrice,
		},
		{
			where: {
				symbol: symbol,
			},
		}
	);
}

async function getChatPairsRaw(chatId) {
	const [result] = await sequelize.query(`
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
	return result.map(r => r.symbol);
}
async function getAlertSymbols(chatId) {
	const [result] = await sequelize.query(`
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
	return result.map(r => r.symbol);
}

async function isAlertSymbolExist(symbol, chatId) {
	const [result] = await sequelize.query(`
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
	return !!result.length;
}

async function getChatPairPrices(chatId) {
	const pairs = await getChatPairsRaw(chatId);
	if (pairs.length === 0) {
		return null;
	}
	const promises = pairs.map((pair) => binance.futuresMarkPrice(pair));
	const result = await Promise.all(promises);
	return result;
}

export default {
	createPair,
	getPairs,
	getChatPairs,
	updatePairPrice,
	getChatPairsRaw,
	getChatPairPrices,
	findPair,
	getAlertSymbols,
	isAlertSymbolExist
};
