import { getPairStats, setPairStats } from './storage/index.js';
import { biggestInArr, diffInPercents, smallestInArr, toFixed } from './utils/number.js';
import emoji from './dictionary/emoji.js';
import { dictionary } from './dictionary/index.js';
import { apiClient } from './api/index.js';
import Binance from 'node-binance-api';
import { Bot } from './bot/index.js';
import { type PairWithEntities } from '../../shared/models/pair.js';
import { type Language, getValidatedLanguage } from '../entities/language.js';

interface FinishedTrigger {
	chatId: number;
	price: number;
	type: string;
	message: string;
	currentPrice: number;
	symbol: string;
}

const binance = new Binance();

const subscriptions: Record<string, any> = {};
const spikeControl: Record<string, { minute: number[]; hour: number[] }> = {};

export function Subscription(symbol: string): void {
	const item = getStorageItemBySymbol(symbol);
	if (!item) {
		return;
	}

	if (subscriptions[item.symbol]) return;
	const endpoint = binance.futuresMarkPriceStream(item.symbol, observe, '@1s');
	spikeControl[symbol] = { minute: [], hour: [] };
	async function observe(data: { markPrice: string }): Promise<void> {
		try {
			const markPrice = parseFloat(data.markPrice);
			const pair = getStorageItemTriggersBySymbol(symbol);
			if (!pair) {
				throw new Error('pair not found');
			}
			if (!item) {
				throw new Error('item not found');
			}

			if (pair.spikes) {
				spikeMonitor(symbol, markPrice);
			}
			const finishedTriggers: FinishedTrigger[] = [];

			pair.prices.forEach((price) => {
				if (
					(price.type === 'ABOVE' && price.price <= markPrice) ||
					(price.type === 'BELOW' && price.price >= markPrice)
				) {
					finishedTriggers.push({
						chatId: price.chatId,
						price: price.price,
						type: price.type,
						message: price.message,
						currentPrice: markPrice,
						symbol: item.symbol,
					});
				}
			});

			for await (const item of finishedTriggers) {
				const msg = [
					item.message,
					`<b>${item.symbol}:</b> ${item.type === 'ABOVE' ? emoji.above : emoji.below} ${
						item.currentPrice
					}`,
					`\nTrigger value: ${item.price}`,
				].join('\n');

				Bot.sendMessage(item.chatId, msg, {
					parse_mode: 'HTML',
				});

				setPairStats(
					item.type
						? await apiClient.removePrice({
								symbol: item.symbol,
								chatId: item.chatId,
								type: item.type,
								price: item.price,
						  })
						: await apiClient.removeSpike({
								symbol: item.symbol,
								chatId: item.chatId,
						  })
				);
			}
			if (
				!getPairStats()
					.map((item) => item.symbol)
					.includes(item.symbol)
			) {
				removeSubscription(item.symbol);
			}
		} catch (error) {
			console.log({
				message: 'removeSubscription',
				error,
			});
			// TODO: resolve this strange type guard
			if (!item) {
				return;
			}
			removeSubscription(item.symbol);
		}
	}
	subscriptions[item.symbol] = endpoint;
}

export async function InitObserver(): Promise<void> {
	const pairs = await apiClient.getPairs();
	setPairStats(pairs.filter((item) => item.prices.length > 0 || item.spikes.length));
	getPairStats().forEach((item) => {
		Subscription(item.symbol);
	});
}

export async function updateStorage(): Promise<void> {
	const result = await apiClient.getPairs();
	setPairStats(result);
}

function removeSubscription(symbol: string): void {
	binance.futuresTerminate(subscriptions[symbol]);
	delete subscriptions[symbol];
}

function getStorageItemBySymbol(symbol: string): PairWithEntities | undefined {
	return getPairStats().find((item) => item.symbol === symbol);
}

function getStorageItemTriggersBySymbol(symbol: string): PairWithEntities | undefined {
	try {
		return getPairStats().find((item) => item.symbol === symbol);
	} catch {
		removeSubscription(symbol);
	}
	return;
}

const counter = {
	second: 0,
	minute: 0,
	hour: 0,
};

function spikeMonitor(symbol: string, markPrice: number): void {
	const minDiffMinute = 0.15;
	const minDiffHour = 0.4;
	counter.second++;

	const current = spikeControl[symbol];

	if (!current) {
		console.log('missing current spikeControl value');
		return;
	}

	if (counter.second === 60) {
		counter.second = 0;
		counter.hour++;
		current.hour.push(markPrice);
	}

	if (counter.hour === 60) {
		counter.hour = 0;
		current.hour.push(markPrice);
	}

	if (current.minute.length === 60) {
		current.minute.pop();
	}

	if (current.minute.length > 1) {
		const biggestInMinute = biggestInArr(current.minute);
		const smallestInMinute = smallestInArr(current.minute);
		const diffInMinute = diffInPercents(biggestInMinute[0], smallestInMinute[0]);
		if (Math.abs(diffInMinute) > minDiffMinute) {
			sendSpikeAlert(
				symbol,
				diffInMinute,
				Math.abs(biggestInMinute[1] - smallestInMinute[1]),
				'сек.',
				smallestInMinute,
				biggestInMinute
			);
		}
		current.minute = [];
	}

	if (current.hour.length === 60) {
		current.hour.pop();
	}

	if (current.hour.length > 1) {
		const biggestInHour = biggestInArr(current.hour);
		const smallestInHour = smallestInArr(current.hour);
		const diffInHour = diffInPercents(biggestInHour[0], smallestInHour[0]);

		if (Math.abs(diffInHour) > minDiffHour) {
			sendSpikeAlert(
				symbol,
				diffInHour,
				Math.abs(biggestInHour[1] - smallestInHour[1]),
				'мин.',
				smallestInHour,
				biggestInHour
			);
			current.hour = [];
		}
	}

	current.minute.push(markPrice);
}

async function sendSpikeAlert(
	symbol: string,
	diff: number,
	interval: number,
	exp: 'сек.' | 'мин.',
	smallest: [number, number],
	biggest: [number, number]
): Promise<void> {
	const spikes = await apiClient.getSpikePairs({ symbol });
	const isBiggestCurrent = biggest[1] > smallest[1];
	const currentPrice = isBiggestCurrent ? biggest[0] : smallest[0];
	const prevPrice = isBiggestCurrent ? smallest[0] : biggest[0];
	spikes.forEach((item) => {
		const msg = spikeMsgWrapper(
			getValidatedLanguage(item.User.lang),
			symbol,
			diff,
			interval,
			exp,
			currentPrice,
			prevPrice,
			isBiggestCurrent
		);
		Bot.sendMessage(item.chatId, msg, {
			parse_mode: 'HTML',
		});
	});
}

function spikeMsgWrapper(
	language: Language,
	symbol: string,
	diff: number,
	interval: number,
	exp: 'сек.' | 'мин.',
	currentPrice: number,
	prevPrice: number,
	isBiggestCurrent: boolean
): string {
	const map = {
		'сек.': dictionary(language).secExp,
		'мин.': dictionary(language).minExp,
	};
	return [
		'<b>' + dictionary(language).priceSpiking + ' ' + emoji.spike,
		symbol +
			' ' +
			toFixed(String(Math.abs(diff))) +
			'%' +
			(isBiggestCurrent ? emoji.above : emoji.belowRed),
		'</b>',
		'<i>' + dictionary(language).interval + ': ' + interval + map[exp],
		dictionary(language).currentPrice + ': ' + Number(currentPrice),
		dictionary(language).previousPrice + ': ' + Number(prevPrice) + '</i>',
	].join('\n');
}
