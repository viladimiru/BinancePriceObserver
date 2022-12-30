import Binance from 'node-binance-api';
import { removePair, getPairs } from './api.js';
import { get, set } from './storage/index.js';
import { SUBSCRIPTIONS } from './storage/const.js';
import eventBus from './utils/eventBus.js';

let subscriptions = {};
const binance = new Binance();

export function Subscription(symbol) {
	const item = getStorageItemBySymbol(symbol);
	if (subscriptions[item.symbol]) return;
	const endpoint = binance.futuresMarkPriceStream(item.symbol, observe, '@1s');
	function observe(data) {
		data.markPrice = parseFloat(data.markPrice);
		const triggers = getStorageItemTriggersBySymbol(symbol);
		const finishedTriggers = [];
		triggers.forEach((trigger) => {
			trigger.prices.forEach((price) => {
				if (
					(price.type === 'ABOVE' && price.price <= data.markPrice) ||
					(price.type === 'BELOW' && price.price >= data.markPrice)
				) {
					finishedTriggers.push({
						chatId: trigger.chatId,
						price: price.price,
						type: price.type,
						message: price.message,
						currentPrice: parseFloat(data.markPrice),
						symbol: item.symbol,
					});
				}
			});
		});
		finishedTriggers.forEach(async (item) => {
			eventBus.emit(
				'sendMessage',
				null,
				item.chatId,
				[
					item.message,
					`<b>${item.symbol}:</b> ${item.type} ${item.currentPrice}`,
					`\nTrigger value: ${item.price}`
				].join('\n'),
				{
					parse_mode: 'HTML',
				}
			);
			set(
				SUBSCRIPTIONS,
				await removePair(item.symbol, item.chatId, item.type, item.price)
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
	set(SUBSCRIPTIONS, await getPairs());
	get(SUBSCRIPTIONS).forEach((item) => {
		Subscription(item.symbol);
	});
}

export async function updateStorage() {
	set(SUBSCRIPTIONS, await getPairs());
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
		return get(SUBSCRIPTIONS).find((item) => item.symbol === symbol).triggers;
	} catch {
		removeSubscription(symbol);
	}
}
