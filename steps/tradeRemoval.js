import pairApi from '../api/pairApi.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import { set } from '../storage/index.js';
import { SUBSCRIPTIONS } from '../storage/const.js';
import dict from '../dict/index.js'

export const DICTIONARY = {
	TRADE_LIST: 'TRADE_LIST',
  REMOVE_TRADE: 'REMOVE_TRADE',
};

const stickerDictionary = {
	LONG: '⬆️',
	SHORT: '⬇️'
}
const typeDictionary = {
	[stickerDictionary.LONG]: 'LONG',
	[stickerDictionary.SHORT]: 'SHORT',
}

export default {
	[DICTIONARY.TRADE_LIST]: {
		id: DICTIONARY.TRADE_LIST,
		text: dict.chooseRemovalPair,
		getPrev: () => 'START',
		getNext: () => DICTIONARY.REMOVE_TRADE,
		validate: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ')
			return await pairApi.isChatTradeExists(msg.chat.id, symbol, typeDictionary[type], price);
		},
		onAnswer: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ');
			await pairApi.removeTrade(symbol, msg.chat.id, typeDictionary[type], price);
			set(SUBSCRIPTIONS, await pairApi.getPairs());
		},
		errorText: dict.youNotCreatedThisPair,
		keyboard: async (msg) => {
			const pairs = await pairApi.getChatTrades(msg.chat.id);
			let count = 0;
			let list = [[]];
			pairs.forEach((pair) => {
				pair.trades.forEach((trade) => {
					if (count !== 0 && count % 3 === 0) {
						list.push([]);
					}
					const lastIndex = list.length - 1;
					list[lastIndex].push({
						text: [
							pair.symbol,
							stickerDictionary[trade.type],
							trade.markPrice
						].join(' '),
					});
					count++;
				});
			});
			return keyboardWrapper(list);
		},
	},
	[DICTIONARY.REMOVE_TRADE]: {
		id: DICTIONARY.REMOVE_TRADE,
		text: dict.tradeSuccessfullyRemoved,
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
