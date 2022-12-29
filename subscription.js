import Binance from 'node-binance-api';
import { removePair, getPairs } from './pairsControl.js';

let bot = null;
let subscriptions = {};
const binance = new Binance();

export function Subscription(coin) {
	if (subscriptions[coin]) return
	const endpoint = binance.futuresMarkPriceStream(coin, observe, '@1s');
	function observe(data) {
		data.markPrice = parseFloat(data.markPrice)
		const triggers = getPairs()[coin].triggers
		const finishedTriggers = [];
		triggers.forEach((item) => {
			item.values.forEach((value) => {
				value[1] = Number(value[1])
				if (
					(value[0] === 'Long' && value[1] <= data.markPrice) ||
					(value[0] === 'Short' && value[1] >= data.markPrice)
				) {
					finishedTriggers.push({
						chatId: item.chatId,
						value: value,
						currentPrice: parseFloat(data.markPrice),
						coin: coin,
					});
				}
			});
		});
		finishedTriggers.forEach((item) => {
			bot.sendMessage(
				item.chatId,
				`<b>${coin}:</b> ${item.value[0]} ${item.currentPrice}\n\nTrigger value: ${item.value[1]}`,
				{
					parse_mode: 'HTML',
				}
			);
			const pairs = removePair(coin, item.chatId, item.value);
			if (!pairs[coin]) {
				removeSubscription(coin)
			}
		});
	}
	subscriptions[coin] = endpoint
	return endpoint;
}

export function InitObserver(_bot) {
	bot = _bot;
	Object.keys(getPairs()).forEach((symbol) => {
		Subscription(symbol);
	});
}

function removeSubscription(symbol) {
	binance.futuresTerminate(subscriptions[symbol])
	delete subscriptions[symbol]
}


