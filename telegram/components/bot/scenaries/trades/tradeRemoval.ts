import { keyboardWrapper } from '../../../utils/keyboard.js';
import { setPairStats } from '../../../storage/index.js';
import emoji from '../../../dictionary/emoji.js';
import DICT from './dict.js';
import { dictionary } from '../../../dictionary/index.js';
import { apiClient } from '../../../api/index.js';
import { Bot, type BotMessage } from '../../index';
import { type KeyboardButton } from 'node-telegram-bot-api';

const stickerDictionary = {
	LONG: emoji.above,
	SHORT: emoji.below,
};
const typeDictionary: Record<string, 'LONG' | 'SHORT'> = {
	[stickerDictionary.LONG]: 'LONG',
	[stickerDictionary.SHORT]: 'SHORT',
};

export default {
	[DICT.removal.TRADE_LIST]: {
		id: DICT.removal.TRADE_LIST,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).choosePair,
		getPrev: () => DICT.default.CHOOSE_TRADE_FUNC,
		getNext: () => DICT.removal.TRADE_LIST,
		validate: async (message: BotMessage) => {
			// todo: validate with onAnswer
			const [symbol, type, price] = message.text.split(' ');
			return await apiClient.isChatTradeExist({
				chatId: message.chat.id,
				symbol,
				type: typeDictionary[type],
				markPrice: Number(price),
			});
		},
		onAnswer: async (message: BotMessage) => {
			const [symbol, type, price] = message.text.split(' ');
			await apiClient.removeTrade({
				symbol,
				chatId: message.chat.id,
				type: typeDictionary[type],
				markPrice: Number(price),
			});
			setPairStats(await apiClient.getPairs());
			await Bot.sendMessage(
				message.chat.id,
				dictionary(message.from.language_code).tradeSuccessfullyRemoved
			);
		},
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).youNotCreatedThisPair,
		keyboard: async (message: BotMessage) => {
			const pairs = await apiClient.getChatTrades({
				chatId: message.chat.id,
			});
			let count = 0;
			const list: KeyboardButton[][] = [[]];
			pairs.forEach((pair) => {
				pair.trades.forEach((trade) => {
					if (count !== 0 && count % 3 === 0) {
						list.push([]);
					}
					const lastListItem = list[list.length - 1];
					if (lastListItem && Array.isArray(lastListItem)) {
						lastListItem.push({
							text: [
								pair.symbol,
								stickerDictionary[trade.type],
								trade.markPrice,
							].join(' '),
						});
						count++;
					}
				});
			});
			return keyboardWrapper(list, {
				language_code: message.from.language_code,
			});
		},
	},
};
