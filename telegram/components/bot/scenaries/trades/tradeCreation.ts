import { keyboardWrapper } from '../../../utils/keyboard.js';
import { Subscription, updateStorage } from '../../../subscription.js';
import DICT from './dict.js';
import { dictionary } from '../../../dictionary/index.js';
import { apiClient } from '../../../api/index.js';
import { Bot, type BotMessage } from '../../index';

const history: Record<number, any> = {};

export default {
	[DICT.creation.SYMBOL]: {
		id: DICT.creation.SYMBOL,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).symbol,
		keyboard: (message: BotMessage) =>
			keyboardWrapper([], {
				language_code: message.from.language_code,
			}),
		validate: async ({ text }: BotMessage) => {
			try {
				return await apiClient.getPairIndex({
					symbol: text.toUpperCase(),
				});
			} catch {
				return false;
			}
		},
		onAnswer: async (message: BotMessage) => {
			history[message.chat.id] = {
				chatId: message.chat.id,
				symbol: message.text.toUpperCase(),
			};
		},
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).pairNotExists,
		getPrev: () => DICT.default.CHOOSE_TRADE_FUNC,
		getNext: () => DICT.creation.TYPE,
	},
	[DICT.creation.TYPE]: {
		id: DICT.creation.TYPE,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).tradeType,
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(message.from.language_code).long,
						},
						{
							text: dictionary(message.from.language_code).short,
						},
					],
				],
				{
					language_code: message.from.language_code,
				}
			),
		expects: (message: BotMessage) => [
			dictionary(message.from.language_code).long,
			dictionary(message.from.language_code).short,
		],
		onAnswer: async (message: BotMessage) => {
			history[message.chat.id].type = message.text.toUpperCase();
		},
		getNext: () => DICT.creation.PRICE,
		getPrev: () => DICT.creation.SYMBOL,
	},
	[DICT.creation.PRICE]: {
		id: DICT.creation.PRICE,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).tradePrice,
		keyboard: (message: BotMessage) =>
			keyboardWrapper([], {
				language_code: message.from.language_code,
			}),
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).alertPriceError,
		validate: ({ text }: BotMessage) => {
			return !isNaN(Number(text));
		},
		onAnswer: async (message: BotMessage) => {
			history[message.chat.id].markPrice = Number(message.text);
		},
		getNext: () => DICT.creation.SHOULDER,
		getPrev: () => DICT.creation.TYPE,
	},
	[DICT.creation.SHOULDER]: {
		id: DICT.creation.SHOULDER,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).shoulder,
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).enterOnlyNumbers,
		keyboard: (message: BotMessage) =>
			keyboardWrapper([], {
				language_code: message.from.language_code,
			}),
		validate: ({ text }: BotMessage) => {
			return !isNaN(Number(text));
		},
		onAnswer: async (message: BotMessage) => {
			history[message.chat.id].shoulder = Number(message.text);
		},
		getPrev: () => DICT.creation.PRICE,
		getNext: () => DICT.creation.TAKE_PROFIT,
	},
	[DICT.creation.TAKE_PROFIT]: {
		id: DICT.creation.TAKE_PROFIT,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).takeProfitIfExist,
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).alertPriceError,
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(message.from.language_code).miss,
						},
					],
				],
				{
					language_code: message.from.language_code,
				}
			),
		validate: (message: BotMessage) => {
			return (
				message.text === dictionary(message.from.language_code).miss ||
				!isNaN(Number(message.text))
			);
		},
		onAnswer: async (message: BotMessage) => {
			if (message.text !== dictionary(message.from.language_code).miss) {
				history[message.chat.id].takeProfit = Number(message.text);
			}
		},
		getPrev: () => DICT.creation.SHOULDER,
		getNext: () => DICT.creation.STOP_LOSS,
	},
	[DICT.creation.STOP_LOSS]: {
		id: DICT.creation.STOP_LOSS,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).stopLossIfExist,
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).alertPriceError,
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(message.from.language_code).miss,
						},
					],
				],
				{
					language_code: message.from.language_code,
				}
			),
		validate: ({ text, from: { language_code } }: BotMessage) => {
			return text === dictionary(language_code).miss || !isNaN(Number(text));
		},
		onAnswer: async (message: BotMessage) => {
			if (message.text !== dictionary(message.from.language_code).miss) {
				history[message.chat.id].stopLoss = Number(message.text);
			}
		},
		getPrev: () => DICT.creation.TAKE_PROFIT,
		getNext: () => DICT.creation.SPIKING,
	},
	[DICT.creation.SPIKING]: {
		id: DICT.creation.SPIKING,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).spikingIfNeeded,
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(message.from.language_code).yes,
						},
						{
							text: dictionary(message.from.language_code).miss,
						},
					],
				],
				{
					language_code: message.from.language_code,
				}
			),
		expects: (message: BotMessage) => [
			dictionary(message.from.language_code).miss,
			dictionary(message.from.language_code).yes,
		],
		onAnswer: async (message: BotMessage) => {
			// todo: controller POST createTrade
			if (message.text !== dictionary(message.from.language_code).miss) {
				history[message.chat.id].spiking = true;
			}
			const payload = history[message.chat.id];
			await apiClient.createTrade(payload);

			if (payload.stopLoss) {
				await apiClient.createPriceWithSymbol({
					chatId: message.chat.id,
					message: dictionary(message.from.language_code).messageTemplates[0],
					type:
						payload.type ===
						dictionary(message.from.language_code).long.toUpperCase()
							? 'BELOW'
							: 'ABOVE',
					price: payload.stopLoss,
					symbol: payload.symbol,
				});
			}

			if (payload.takeProfit) {
				await apiClient.createPriceWithSymbol({
					chatId: message.chat.id,
					message: dictionary(message.from.language_code).messageTemplates[1],
					type:
						payload.type ===
						dictionary(message.from.language_code).short.toUpperCase()
							? 'BELOW'
							: 'ABOVE',
					price: payload.takeProfit,
					symbol: payload.symbol,
				});
			}

			if (payload.spiking) {
				await apiClient.createSpikeWithSymbol({
					chatId: message.chat.id,
					symbol: payload.symbol,
				});
			}

			if (payload.stopLoss || payload.takeProfit || payload.spiking) {
				await updateStorage();
				Subscription(payload.symbol);
			}

			await Bot.sendMessage(
				message.chat.id,
				dictionary(message.from.language_code).tradeCreated,
				{
					parse_mode: 'HTML',
				}
			);
			delete history[message.chat.id];
		},
		getPrev: () => DICT.creation.STOP_LOSS,
		getNext: () => DICT.default.CHOOSE_TRADE_FUNC,
	},
};
