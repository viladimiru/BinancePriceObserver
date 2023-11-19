import { type KeyboardButton } from 'node-telegram-bot-api';
import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { Bot, type BotMessage } from '../../..';
import { apiClient } from '../../../../api';
import { setPairStats } from '../../../../storage';
import emoji from '../../../../dictionary/emoji';
import { alertRemovalStore } from './store';

const stickerDictionary: Record<string, string> = {
	undefined: emoji.spike,
	ABOVE: emoji.above,
	BELOW: emoji.below,
};
const typeDictionary = {
	[stickerDictionary.ABOVE]: 'ABOVE',
	[stickerDictionary.BELOW]: 'BELOW',
};

export const alertsListView = createView({
	id: 'ALERTS_LIST',
	text: (message: BotMessage) => dictionary(message.from.language_code).chooseRemovalAlert,
	validate: async (message: BotMessage) => {
		const [symbol, type, price] = message.text.split(' ');
		if (!typeDictionary[type]) {
			return await apiClient.isSpikeExist({
				symbol,
				chatId: message.chat.id,
			});
		}
		return await apiClient.isPriceExist({
			chatId: message.chat.id,
			symbol,
			type: typeDictionary[type],
			price: Number(price),
		});
	},
	onAnswer: async (message: BotMessage) => {
		const [symbol, type, price] = message.text.split(' ');
		alertRemovalStore.set(String(message.chat.id), { symbol });

		// TODO: IT SHOULD BE ONE FUNCTION
		if (typeDictionary[type]) {
			await apiClient.removePrice({
				symbol,
				chatId: message.chat.id,
				type: typeDictionary[type],
				price: Number(price),
			});
		} else {
			await apiClient.removeSpike({
				symbol,
				chatId: message.chat.id,
			});
		}
		const pairs = await apiClient.getPairs();
		setPairStats(pairs.filter((item) => item.prices.length > 0 || item.spikes.length));
		await Bot.sendMessage(
			message.chat.id,
			dictionary(message.from.language_code).pairSuccessfullyRemoved
		);
	},
	errorText: (message: BotMessage) => dictionary(message.from.language_code).youNotCreatedThisPair,
	keyboard: async (message: BotMessage) => {
		// TODO: fix get chat pairs history
		const symbol = alertRemovalStore.get(String(message.chat.id))?.symbol;
		if (!symbol) {
			// TODO: think how to throw and handle errors
			throw new Error('missing symbol');
		}
		const pairs = await apiClient.getChatPairs({
			chatId: message.chat.id,
			symbol,
		});
		let count = 0;
		const list: KeyboardButton[][] = [[]];
		pairs.forEach((pair) => {
			pair.prices.forEach((price) => {
				if (count !== 0 && count % 3 === 0) {
					list.push([]);
				}
				const lastIndex = list.length - 1;
				list[lastIndex].push({
					text: [pair.symbol, stickerDictionary[price.type], price.price].join(' '),
				});
				count++;
			});
			pair.spikes.forEach((spike) => {
				if (count !== 0 && count % 3 === 0) {
					list.push([]);
				}
				const lastIndex = list.length - 1;
				list[lastIndex].push({
					text: [pair.symbol, stickerDictionary.undefined].join(' '),
				});
				count++;
			});
		});
		list.push([
			{
				text: dictionary(message.from.language_code).back,
			},
			{
				text: dictionary(message.from.language_code).toTheMain,
			},
		]);
		return keyboardWrapper(
			list,
			{
				language_code: message.from.language_code,
			},
			true
		);
	},
});
