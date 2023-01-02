import pairApi from '../api/pairApi.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import { set, get, PAIR_STATS, BOT_MESSANGER } from '../storage/index.js';
import dict from '../dict/lang/index.js'
import emoji from '../dict/emoji.js';
import spikeApi from '../api/spikeApi.js';
import priceApi from '../api/priceApi.js';

export const DICTIONARY = {
	PAIRS_LIST: 'PAIRS_LIST',
	REMOVE_PAIR: 'REMOVE_PAIR',
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

export default {
	[DICTIONARY.PAIRS_LIST]: {
		id: 'PAIRS_LIST',
		text: dict.chooseRemovalPair,
		getPrev: () => 'START',
		getNext: () => DICTIONARY.PAIRS_LIST,
		validate: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ')
			if (!typeDictionary[type]) {
				return await spikeApi.isSpikeExist(symbol, msg.chat.id)
			}
			return await priceApi.isPriceExist(msg.chat.id, symbol, typeDictionary[type], price);
		},
		onAnswer: async (msg) => {
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
			const pairs = await pairApi.getChatPairs(msg.chat.id);
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
			return keyboardWrapper(list);
		},
	},
};
