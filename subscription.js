import Binance from 'node-binance-api';
import pairApi from './api/pairApi.js';
import { get, set } from './storage/index.js';
import { SUBSCRIPTIONS } from './storage/const.js';
import eventBus from './utils/eventBus.js';
import { biggestInArr, diffInPercents, smallestInArr } from './utils/number.js';

let subscriptions = {};
const spikeControl = {};
const binance = new Binance();

export function Subscription(symbol) {
	const item = getStorageItemBySymbol(symbol);
	if (subscriptions[item.symbol]) return;
	const endpoint = binance.futuresMarkPriceStream(item.symbol, observe, '@1s');
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
			eventBus.emit(
				'sendMessage',
				null,
				item.chatId,
				[
					item.message,
					`<b>${item.symbol}:</b> ${item.type === 'ABOVE' ? '⬆️' : '⬇️'} ${
						item.currentPrice
					}`,
					`\nTrigger value: ${item.price}`,
				].join('\n'),
				{
					parse_mode: 'HTML',
				}
			);
			set(
				SUBSCRIPTIONS,
				await pairApi.removePair(
					item.symbol,
					item.chatId,
					item.type,
					item.price
				)
			);
			if (
				!get(SUBSCRIPTIONS)
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
	set(SUBSCRIPTIONS, await pairApi.getPairs());
	get(SUBSCRIPTIONS).forEach((item) => {
		Subscription(item.symbol);
	});
}

export async function updateStorage() {
	set(SUBSCRIPTIONS, await pairApi.getPairs());
}

async function removeSubscription(symbol) {
	binance.futuresTerminate(subscriptions[symbol]);
	delete subscriptions[symbol];
}

function getStorageItemBySymbol(symbol) {
	return get(SUBSCRIPTIONS).find((item) => item.symbol === symbol);
}

function getStorageItemTriggersBySymbol(symbol) {

	try {
		return get(SUBSCRIPTIONS).find((item) => item.symbol === symbol);
	} catch {
		removeSubscription(symbol);
	}
}

const counter = {
	second: 0,
	minute: 0
}

function spikeMonitor(symbol, markPrice) {
	const minDiffMinute = 0.3
	const minDiffHour = 0.6
	counter.second++

	if (!spikeControl[symbol]) {
		spikeControl[symbol] = { minute: [], hour: [] };
	}
	
	const current = spikeControl[symbol];

	if (counter.second === 60) {
		counter.second = 0
		counter.hour++
		current.hour.push(markPrice);
	}

	if (counter.hour === 60) {
		counter.hour = 0
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
				biggestInMinute[0]
			)
			current.minute = current.minute
				.filter(
					item =>
						item !== biggestInMinute[0] &&
						item !== smallestInMinute[0]
				)
			
		}
	}

	if (current.hour.length === 60) {
		current.hour.pop();
	}

	if (current.hour.length > 1) {

		const biggestInHour = biggestInArr(current.hour);
		const smallestInHour = smallestInArr(current.hour);
		const diffInHour = diffInPercents(
			biggestInHour[0],
			smallestInHour[0]
		);

		if (Math.abs(diffInHour) > minDiffHour) {
			sendSpikeAlert(
				symbol,
				diffInHour,
				Math.abs(biggestInHour[1] - smallestInHour[1]),
				'мин.',
				biggestInHour[0]
			)
			current.hour = current.hour
				.filter(
					item =>
						item !== biggestInHour[0] &&
						item !== smallestInHour[0]
				)
		}
	}

	current.minute.push(markPrice);
}

async function sendSpikeAlert(symbol, diff, interval, exp, markPrice) {
	const spikes = await pairApi.getSpikePairs(symbol)
	spikes.forEach((item) => {
		eventBus.emit('sendMessage', null, item.chatId, [
			'<b>Скачки цен 📈</b>\n',
			symbol,
			'Разница: ' + Math.abs(diff) + '%' + (diff >= 0 ? '⬆️' : '⬇️'),
			'Интервал: ' + interval + exp,
			'Цена: ' + markPrice
		].join('\n'), {
			parse_mode: 'HTML'
		})
	})
}