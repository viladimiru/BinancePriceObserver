import { type KeyboardButton } from 'node-telegram-bot-api';
import { type BotMessage } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { createView } from '../../../scenary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { alertRemovalStore } from './store';

export const pairsListView = createView({
	id: 'PAIRS_LIST',
	text: (message: BotMessage) =>
		dictionary(message.from.language_code).choosePair,
	validate: async (message: BotMessage) => {
		return await apiClient.isAlertSymbolExist({
			symbol: message.text,
			chatId: message.chat.id,
		});
	},
	onAnswer: async (message: BotMessage) => {
		const symbol = message.text.toUpperCase();
		alertRemovalStore.set(String(message.chat.id), { symbol });
	},
	errorText: (message: BotMessage) =>
		dictionary(message.from.language_code).youNotCreatedThisPair,
	keyboard: async (message: BotMessage) => {
		const pairs = await apiClient.getAlertSymbols({
			chatId: message.chat.id,
		});
		let count = 0;
		const list: KeyboardButton[][] = [[]];
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
			language_code: message.from.language_code,
		});
	},
});
