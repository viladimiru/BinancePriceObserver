import { keyboardWrapper } from '../../../utils/keyboard.js';
import { setPairStats } from '../../../storage/index.js';
import emoji from '../../../dictionary/emoji.js';
import DICT from './dict.js';
import { dictionary } from '../../../dictionary/index.js';
import { apiClient } from '../../../api/index.js';
import { Bot, type BotMessage } from '../../index';
import type { KeyboardButton } from 'node-telegram-bot-api';

const stickerDictionary: Record<string, string> = {
	undefined: emoji.spike,
	ABOVE: emoji.above,
	BELOW: emoji.below,
};
const typeDictionary = {
	[stickerDictionary.ABOVE]: 'ABOVE',
	[stickerDictionary.BELOW]: 'BELOW',
};
const history: Record<number, any> = {};

export default {
	[DICT.removal.PAIRS_LIST]: {
		id: DICT.removal.PAIRS_LIST,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).choosePair,
		getPrev: () => DICT.default.CHOOSE_PAIR_FUNC,
		getNext: () => DICT.removal.ALERTS_LIST,
		validate: async (message: BotMessage) => {
			return await apiClient.isAlertSymbolExist({
				symbol: message.text,
				chatId: message.chat.id,
			});
		},
		onAnswer: async (message: BotMessage) => {
			history[message.chat.id] = message.text.toUpperCase();
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
	},
	[DICT.removal.ALERTS_LIST]: {
		id: DICT.removal.ALERTS_LIST,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).chooseRemovalAlert,
		getPrev: () => DICT.removal.PAIRS_LIST,
		getNext: (message: BotMessage) => {
			if (
				message.text === dictionary(message.from.language_code).deleteAllAlerts
			) {
				return DICT.removal.PAIRS_LIST;
			}
			return DICT.removal.ALERTS_LIST;
		},
		validate: async (message: BotMessage) => {
			// TODO: move all async validation in onAnswer
			if (
				message.text === dictionary(message.from.language_code).deleteAllAlerts
			) {
				return true;
			}
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
			if (
				message.text === dictionary(message.from.language_code).deleteAllAlerts
			) {
				await apiClient.deleteAlerts({
					chatId: message.chat.id,
					symbol: history[message.chat.id],
				});
				return;
			}
			const [symbol, type, price] = message.text.split(' ');
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
			setPairStats(
				pairs.filter((item) => item.prices.length > 0 || item.spikes.length)
			);
			await Bot.sendMessage(
				message.chat.id,
				dictionary(message.from.language_code).pairSuccessfullyRemoved
			);
		},
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).youNotCreatedThisPair,
		keyboard: async (message: BotMessage) => {
			const pairs = await apiClient.getChatPairs({
				chatId: message.chat.id,
				symbol: history[message.chat.id],
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
						text: [
							pair.symbol,
							stickerDictionary[price.type],
							price.price,
						].join(' '),
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
			list.push(
				// TODO: This functional delete all client alerts
				// [
				// 	{
				// 		text: dictionary(message.from.language_code).deleteAllAlerts,
				// 	},
				// ],
				[
					{
						text: dictionary(message.from.language_code).back,
					},
					{
						text: dictionary(message.from.language_code).toTheMain,
					},
				]
			);
			return keyboardWrapper(
				list,
				{
					language_code: message.from.language_code,
				},
				true
			);
		},
	},
};
