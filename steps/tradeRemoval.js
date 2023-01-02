import pairApi from '../api/pairApi.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import { set, PAIR_STATS, get, BOT_MESSANGER } from '../storage/index.js';
import dict from '../dict/lang/index.js'
import tradeApi from '../api/tradeApi.js';
import emoji from '../dict/emoji.js';

export const DICTIONARY = {
	TRADE_LIST: 'TRADE_LIST',
  REMOVE_TRADE: 'REMOVE_TRADE',
};

const stickerDictionary = {
	LONG: emoji.above,
	SHORT: emoji.below
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
		getNext: () => DICTIONARY.TRADE_LIST,
		validate: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ')
			return await tradeApi.isChatTradeExists(msg.chat.id, symbol, typeDictionary[type], price);
		},
		onAnswer: async (msg) => {
			const [symbol, type, price] = msg.text.split(' ');
			await tradeApi.removeTrade(symbol, msg.chat.id, typeDictionary[type], price);
			set(PAIR_STATS, await pairApi.getPairs());
			await get(BOT_MESSANGER)(msg.chat.id, dict.tradeSuccessfullyRemoved)
		},
		errorText: dict.youNotCreatedThisPair,
		keyboard: async (msg) => {
			const pairs = await tradeApi.getChatTrades(msg.chat.id);
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
};
