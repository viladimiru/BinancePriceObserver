import { type KeyboardButton } from 'node-telegram-bot-api';
import { Bot } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { setPairStats } from '../../../../storage';
import { createView } from '../../../scenary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import emoji from '../../../../dictionary/emoji';

const stickerDictionary = {
	LONG: emoji.above,
	SHORT: emoji.below,
};
const typeDictionary: Record<string, 'LONG' | 'SHORT'> = {
	[stickerDictionary.LONG]: 'LONG',
	[stickerDictionary.SHORT]: 'SHORT',
};

export const tradeListView = createView({
	id: 'TRADE_LIST',
	text: (message) => dictionary(message.from.language_code).choosePair,
	validate: async (message) => {
		const [symbol, type, price] = message.text.split(' ');
		return await apiClient.isChatTradeExist({
			chatId: message.chat.id,
			symbol,
			type: typeDictionary[type],
			markPrice: Number(price),
		});
	},
	onAnswer: async (message) => {
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
	errorText: (message) => dictionary(message.from.language_code).youNotCreatedThisPair,
	keyboard: async (message) => {
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
						text: [pair.symbol, stickerDictionary[trade.type], trade.markPrice].join(' '),
					});
					count++;
				}
			});
		});
		return keyboardWrapper(list, {
			language_code: message.from.language_code,
		});
	},
});
