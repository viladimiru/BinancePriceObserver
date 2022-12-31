import pairApi from '../api/pairApi.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import { set } from '../storage/index.js';
import { SUBSCRIPTIONS } from '../storage/const.js';
import dict from '../dict/index.js'

export const DICTIONARY = {
	PAIRS_LIST: 'PAIRS_LIST',
	REMOVE_PAIR: 'REMOVE_PAIR',
};

export default {
	[DICTIONARY.PAIRS_LIST]: {
		id: 'PAIRS_LIST',
		text: dict.chooseRemovalPair,
		getPrev: () => 'START',
		getNext: () => DICTIONARY.REMOVE_PAIR,
		validate: async (msg) => {
			return await pairApi.isChatPairExists(msg.chat.id, ...msg.text.split(' '));
		},
		onAnswer: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ');
			await pairApi.removePair(symbol, msg.chat.id, type, price);
			set(SUBSCRIPTIONS, await pairApi.getPairs());
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
							price.type,
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
							price.type,
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
		getPrev: () => 'START',
		getNext: () => DICTIONARY.REMOVE_PAIR,
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
