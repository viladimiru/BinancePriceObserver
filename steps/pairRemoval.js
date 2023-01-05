import pairApi from '../api/pairApi.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import { set, get, PAIR_STATS, BOT_MESSANGER } from '../storage/index.js';
import dict from '../dict/lang/index.js'
import emoji from '../dict/emoji.js';
import spikeApi from '../api/spikeApi.js';
import priceApi from '../api/priceApi.js';
import alertApi from '../api/alertApi.js';

export const DICTIONARY = {
	PAIRS_LIST: 'PAIRS_LIST',
	ALERTS_LIST: 'ALERTS_LIST',
};

const stickerDictionary = {
	undefined: emoji.spike,
	ABOVE: emoji.above,
	BELOW: emoji.below
}
const typeDictionary = {
	[stickerDictionary.ABOVE]: 'ABOVE',
	[stickerDictionary.BELOW]: 'BELOW',
}
const history = {}

export default {
	[DICTIONARY.PAIRS_LIST]: {
		id: DICTIONARY.PAIRS_LIST,
		text: dict.choosePair,
		getPrev: () => 'START',
		getNext: () => DICTIONARY.ALERTS_LIST,
		validate: async (msg) => {
			return await pairApi.isAlertSymbolExist(msg.text, msg.chat.id)
		},
		onAnswer: async (msg) => {
			history[msg.chat.id] = msg.text.toUpperCase()
		},
		errorText: dict.youNotCreatedThisPair,
		keyboard: async (msg) => {
			const pairs = await pairApi.getAlertSymbols(msg.chat.id);
			let count = 0;
			let list = [[]];
			pairs.forEach((pair) => {
				if (count !== 0 && count % 3 === 0) {
					list.push([]);
				}
				const lastIndex = list.length - 1;
				list[lastIndex].push({
					text: pair,
				});
				count++;
			});
			return keyboardWrapper(list);
		},
	},
	[DICTIONARY.ALERTS_LIST]: {
		id: DICTIONARY.ALERTS_LIST,
		text: dict.chooseRemovalAlert,
		getPrev: () => DICTIONARY.PAIRS_LIST,
		getNext: (msg) => {
			if (msg.text === dict.deleteAllAlerts) {
				return DICTIONARY.PAIRS_LIST
			}
			return DICTIONARY.ALERTS_LIST
		},
		validate: async (msg) => {
			if (msg.text === dict.deleteAllAlerts) {
				return true
			}
			const [symbol, type, price] = msg.text.split(' ')
			if (!typeDictionary[type]) {
				return await spikeApi.isSpikeExist(symbol, msg.chat.id)
			}
			return await priceApi.isPriceExist(msg.chat.id, symbol, typeDictionary[type], price);
		},
		onAnswer: async (msg) => {
			if (msg.text === dict.deleteAllAlerts) {
				return await alertApi.deleteAlerts(msg.chat.id, history[msg.chat.id])
			}
			const [symbol, type, price] = msg.text.split(' ');
			if (typeDictionary[type]) {
				await priceApi.removePrice(symbol, msg.chat.id, typeDictionary[type], price)
			} else {
				await spikeApi.removeSpike(symbol, msg.chat.id)
			}
			set(PAIR_STATS, await pairApi.getPairs());
			await get(BOT_MESSANGER)(msg.chat.id, dict.pairSuccessfullyRemoved)
		},
		errorText: dict.youNotCreatedThisPair,
		keyboard: async (msg) => {
			const pairs = await pairApi.getChatPairs(msg.chat.id, history[msg.chat.id]);
			let count = 0;
			let list = [[]];
			pairs.forEach((pair) => {
				pair.prices.forEach((price) => {
					if (count !== 0 && count % 3 === 0) {
						list.push([]);
					}
					const lastIndex = list.length - 1;
					list[lastIndex].push({
						text: [
							pair.symbol,
							stickerDictionary[price.type],
							price.price
						].join(' '),
					});
					count++;
				});
				pair.spikes.forEach((price) => {
					if (count !== 0 && count % 3 === 0) {
						list.push([]);
					}
					const lastIndex = list.length - 1;
					list[lastIndex].push({
						text: [
							pair.symbol,
							stickerDictionary[price.type],
							price.price
						].join(' '),
					});
					count++;
				});
			});
			list.push(
				[
					{
						text: dict.deleteAllAlerts
					}
				],
				[
					{
						text: dict.back
					},
					{
						text: dict.toTheMain
					},
				]
			)
			return keyboardWrapper(list, null, true);
		},
	},
};
