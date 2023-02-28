import pairApi from '../../api/pairApi.js';
import { keyboardWrapper } from '../../utils/keyboard.js';
import { set, get, PAIR_STATS, BOT_MESSANGER } from '../../storage/index.js';
import emoji from '../../dict/emoji.js';
import spikeApi from '../../api/spikeApi.js';
import priceApi from '../../api/priceApi.js';
import alertApi from '../../api/alertApi.js';
import DICT from './dict.js';
import { dictionary } from '../../dict/index.js';

const stickerDictionary = {
	undefined: emoji.spike,
	ABOVE: emoji.above,
	BELOW: emoji.below,
};
const typeDictionary = {
	[stickerDictionary.ABOVE]: 'ABOVE',
	[stickerDictionary.BELOW]: 'BELOW',
};
const history = {};

export default {
	[DICT.removal.PAIRS_LIST]: {
		id: DICT.removal.PAIRS_LIST,
		text: (msg) => dictionary(msg.from.language_code).choosePair,
		getPrev: () => DICT.default.CHOOSE_PAIR_FUNC,
		getNext: () => DICT.removal.ALERTS_LIST,
		validate: async (msg) => {
			return await pairApi.isAlertSymbolExist(msg.text, msg.chat.id);
		},
		onAnswer: async (msg) => {
			history[msg.chat.id] = msg.text.toUpperCase();
		},
		errorText: (msg) =>
			dictionary(msg.from.language_code).youNotCreatedThisPair,
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
			return keyboardWrapper(list, {
				language_code: msg.from.language_code,
			});
		},
	},
	[DICT.removal.ALERTS_LIST]: {
		id: DICT.removal.ALERTS_LIST,
		text: (msg) => dictionary(msg.from.language_code).chooseRemovalAlert,
		getPrev: () => DICT.removal.PAIRS_LIST,
		getNext: (msg) => {
			if (msg.text === dictionary(msg.from.language_code).deleteAllAlerts) {
				return DICT.removal.PAIRS_LIST;
			}
			return DICT.removal.ALERTS_LIST;
		},
		validate: async (msg) => {
			if (msg.text === dictionary(msg.from.language_code).deleteAllAlerts) {
				return true;
			}
			const [symbol, type, price] = msg.text.split(' ');
			if (!typeDictionary[type]) {
				return await spikeApi.isSpikeExist(symbol, msg.chat.id);
			}
			return await priceApi.isPriceExist(
				msg.chat.id,
				symbol,
				typeDictionary[type],
				price
			);
		},
		onAnswer: async (msg) => {
			if (msg.text === dictionary(msg.from.language_code).deleteAllAlerts) {
				return await alertApi.deleteAlerts(msg.chat.id, history[msg.chat.id]);
			}
			const [symbol, type, price] = msg.text.split(' ');
			if (typeDictionary[type]) {
				await priceApi.removePrice(
					symbol,
					msg.chat.id,
					typeDictionary[type],
					price
				);
			} else {
				await spikeApi.removeSpike(symbol, msg.chat.id);
			}
			const pairs = await pairApi.getPairs();
			set(
				PAIR_STATS,
				pairs.filter((item) => item.prices.length || item.spikes.length)
			);
			await get(BOT_MESSANGER)(
				msg.chat.id,
				dictionary(msg.from.language_code).pairSuccessfullyRemoved
			);
		},
		errorText: (msg) =>
			dictionary(msg.from.language_code).youNotCreatedThisPair,
		keyboard: async (msg) => {
			const pairs = await pairApi.getChatPairs(
				msg.chat.id,
				history[msg.chat.id]
			);
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
							price.price,
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
							price.price,
						].join(' '),
					});
					count++;
				});
			});
			list.push(
				// TODO: This functional delete all client alerts
				// [
				// 	{
				// 		text: dictionary(msg.from.language_code).deleteAllAlerts,
				// 	},
				// ],
				[
					{
						text: dictionary(msg.from.language_code).back,
					},
					{
						text: dictionary(msg.from.language_code).toTheMain,
					},
				]
			);
			return keyboardWrapper(
				list,
				{
					language_code: msg.from.language_code,
				},
				true
			);
		},
	},
};
