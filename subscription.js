import Binance from 'node-binance-api';
import spikeApi from './api/spikeApi.js';
import pairApi from './api/pairApi.js';
import priceApi from './api/priceApi.js'
import { get, set, PAIR_STATS, BOT_MESSANGER } from './storage/index.js';
import {
	biggestInArr,
	diffInPercents,
	smallestInArr,
	toFixed,
} from './utils/number.js';
import emoji from './dict/emoji.js';

let subscriptions = {};
const spikeControl = {};
const binance = new Binance();

export function Subscription(symbol) {
	const item = getStorageItemBySymbol(symbol);
	if (subscriptions[item.symbol]) return;
	const endpoint = binance.futuresMarkPriceStream(item.symbol, observe, '@1s');
	spikeControl[symbol] = { minute: [], hour: [] };
	function observe(data) {
		data.markPrice = parseFloat(data.markPrice);
		const pair = getStorageItemTriggersBySymbol(symbol);

		if (pair.spikes) {
			spikeMonitor(symbol, data.markPrice);
		}
		const finishedTriggers = [];

		pair.prices.forEach((price) => {
			if (
				(price.type === 'ABOVE' && price.price <= data.markPrice) ||
				(price.type === 'BELOW' && price.price >= data.markPrice)
			) {
				finishedTriggers.push({
					chatId: price.chatId,
					price: price.price,
					type: price.type,
					message: price.message,
					currentPrice: parseFloat(data.markPrice),
					symbol: item.symbol,
				});
			}
		});
		finishedTriggers.forEach(async (item) => {
			get(BOT_MESSANGER)(
				item.chatId,
				[
					item.message,
					`<b>${item.symbol}:</b> ${
						item.type === 'ABOVE' ? emoji.above : emoji.below
					} ${item.currentPrice}`,
					`\nTrigger value: ${item.price}`,
				].join('\n'),
				{
					parse_mode: 'HTML',
				}
			);
			set(
				PAIR_STATS,
				item.type
					? await priceApi.removePrice(item.symbol, item.chatId, item.type, item.price)
					: await spikeApi.removeSpike(item.symbol, item.chatId)
			);
			if (
				!get(PAIR_STATS)
					.map((item) => item.symbol)
					.includes(item.symbol)
			) {
				removeSubscription(item.symbol);
			}
		});
	}
	subscriptions[item.symbol] = endpoint;
	return endpoint;
}

export async function InitObserver(_bot) {
	set(PAIR_STATS, await pairApi.getPairs());
	get(PAIR_STATS).forEach((item) => {
		Subscription(item.symbol);
	});
}

export async function updateStorage() {
	set(PAIR_STATS, await pairApi.getPairs());
}

async function removeSubscription(symbol) {
	binance.futuresTerminate(subscriptions[symbol]);
	delete subscriptions[symbol];
}

function getStorageItemBySymbol(symbol) {
	return get(PAIR_STATS).find((item) => item.symbol === symbol);
}

function getStorageItemTriggersBySymbol(symbol) {
	try {
		return get(PAIR_STATS).find((item) => item.symbol === symbol);
	} catch {
		removeSubscription(symbol);
	}
}

const counter = {
	second: 0,
	minute: 0,
};

function spikeMonitor(symbol, markPrice) {
	const minDiffMinute = 0.15;
	const minDiffHour = 0.4;
	counter.second++;

	const current = spikeControl[symbol];

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
		const diffInMinute = diffInPercents(
			biggestInMinute[0],
			smallestInMinute[0]
		);
		if (Math.abs(diffInMinute) > minDiffMinute) {
			sendSpikeAlert(
				symbol,
				diffInMinute,
				Math.abs(biggestInMinute[1] - smallestInMinute[1]),
				'сек.',
				smallestInMinute,
				biggestInMinute
			);
			current.minute = [];
		}
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

async function sendSpikeAlert(symbol, diff, interval, exp, smallest, biggest) {
	const spikes = await spikeApi.getSpikePairs(symbol);
	const isBiggestCurrent = biggest[1] > smallest[1];
	const currentPrice = isBiggestCurrent ? biggest[0] : smallest[0];
	const prevPrice = isBiggestCurrent ? smallest[0] : biggest[0];
	spikes.forEach((item) => {
		get(BOT_MESSANGER)(
			item.chatId,
			[
				'<b>Скачки цен ' + emoji.spike,
				symbol +
					' ' +
					toFixed(Math.abs(diff)) +
					'%' +
					(isBiggestCurrent ? emoji.above : emoji.belowRed),
				'</b>',
				'<i>Интервал: ' + interval + exp,
				'Текущая цена: ' + Number(currentPrice),
				'Предыдущая цена: ' + Number(prevPrice) + '</i>',
			].join('\n'),
			{
				parse_mode: 'HTML',
			}
		);
	});
}
