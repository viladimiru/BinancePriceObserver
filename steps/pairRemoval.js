import pairApi from '../api/pairApi.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import { set, PAIR_STATS } from '../storage/index.js';
import dict from '../dict/lang/index.js'
import emoji from '../dict/emoji.js';

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
		getNext: () => DICTIONARY.REMOVE_PAIR,
		validate: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ')
			return await pairApi.isChatPairExists(msg.chat.id, symbol, typeDictionary[type], price);
		},
		onAnswer: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ');
			await pairApi.removePair(symbol, msg.chat.id, typeDictionary[type], price);
			set(PAIR_STATS, await pairApi.getPairs());
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
	[DICTIONARY.REMOVE_PAIR]: {
		id: DICTIONARY.REMOVE_PAIR,
		text: dict.pairSuccessfullyRemoved,
		getNext: () => 'START',
		keyboard: keyboardWrapper(
			[
				[
					{
						text: dict.toTheMain,
					},
				],
			],
			null,
			true
		),
	},
};
