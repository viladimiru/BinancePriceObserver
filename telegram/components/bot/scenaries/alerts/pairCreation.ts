import { updateStorage, Subscription } from '../../../subscription.js';
import { keyboardWrapper } from '../../../utils/keyboard.js';
import DICT from './dict.js';
import { dictionary } from '../../../dictionary/index.js';
import { apiClient } from '../../../api/index.js';
import { Bot, type BotMessage } from '../../index';

const history: Record<number, any> = {};

export default {
	[DICT.creation.ADD_OBSERVER]: {
		id: 'ADD_OBSERVER',
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).symbol,
		keyboard: (message: BotMessage) =>
			keyboardWrapper([], {
				language_code: message.from.language_code,
			}),
		validate: async ({ text }: BotMessage) => {
			try {
				// TODO: validate in onAnswer
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
		getPrev: () => DICT.default.CHOOSE_PAIR_FUNC,
		getNext: () => DICT.creation.CHOOSE_TRADE_TYPE,
	},
	[DICT.creation.CHOOSE_TRADE_TYPE]: {
		id: 'CHOOSE_TRADE_TYPE',
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).sendMessageWhen,
		expects: (message: BotMessage) => [
			dictionary(message.from.language_code).above,
			dictionary(message.from.language_code).below,
			dictionary(message.from.language_code).spiking,
		],
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(message.from.language_code).above,
						},
						{
							text: dictionary(message.from.language_code).below,
						},
					],
					[
						{
							text: dictionary(message.from.language_code).spiking,
						},
					],
				],
				{
					language_code: message.from.language_code,
				}
			),
		onAnswer: async (message: BotMessage) => {
			const type = {
				[dictionary(message.from.language_code).above]: 'ABOVE',
				[dictionary(message.from.language_code).below]: 'BELOW',
				[dictionary(message.from.language_code).spiking]: 'SPIKE',
			}[message.text];
			history[message.chat.id].type = type;
			if (message.text === dictionary(message.from.language_code).spiking) {
				// TODO: controller post createSpikingAlert
				await apiClient.createPair(history[message.chat.id]);
				await updateStorage();
				Subscription(history[message.chat.id].symbol);
				await Bot.sendMessage(
					message.chat.id,
					dictionary(message.from.language_code).pairSuccessfullyCreated
				);
				delete history[message.chat.id];
			}
		},
		getPrev: () => DICT.creation.ADD_OBSERVER,
		getNext: (message: BotMessage) => {
			if (message.text !== dictionary(message.from.language_code).spiking) {
				return DICT.creation.SET_PRICE;
			}
			return DICT.default.CHOOSE_PAIR_FUNC;
		},
	},
	[DICT.creation.SET_PRICE]: {
		id: 'SET_PRICE',
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).enterAlertPrice,
		validate: ({ text }: BotMessage) => {
			return !isNaN(Number(text));
		},
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).alertPriceError,
		keyboard: (message: BotMessage) =>
			keyboardWrapper([], {
				language_code: message.from.language_code,
			}),
		onAnswer: async (message: BotMessage) => {
			history[message.chat.id].price = Number(message.text);
		},
		getPrev: () => DICT.creation.CHOOSE_TRADE_TYPE,
		getNext: () => DICT.creation.SET_MESSAGE,
	},
	[DICT.creation.SET_MESSAGE]: {
		id: 'SET_MESSAGE',
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).messageTemplate,
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					dictionary(message.from.language_code).messageTemplates.map(
						(item) => ({
							text: item,
						})
					),
				],
				{
					language_code: message.from.language_code,
				}
			),
		onAnswer: async (message: BotMessage) => {
			// TODO: controller createPriceAlert
			history[message.chat.id].message = message.text;
			await apiClient.createPair(history[message.chat.id]);
			await updateStorage();
			Subscription(history[message.chat.id].symbol);
			await Bot.sendMessage(
				message.chat.id,
				dictionary(message.from.language_code).pairSuccessfullyCreated
			);
			delete history[message.chat.id];
		},
		getPrev: () => DICT.creation.SET_PRICE,
		getNext: () => DICT.default.CHOOSE_PAIR_FUNC,
	},
};
