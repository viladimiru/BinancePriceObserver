import pairApi from '../../api/pairApi.js';
import { updateStorage, Subscription } from '../../subscription.js';
import { keyboardWrapper } from '../../utils/keyboard.js';
import { BOT_MESSANGER, get } from '../../storage/index.js';
import futuresApi from '../../api/futuresApi.js';
import DICT from './dict.js';
import { dictionary } from '../../dict/index.js';

const history = {};

export default {
	[DICT.creation.ADD_OBSERVER]: {
		id: 'ADD_OBSERVER',
		text: (msg) => dictionary(msg.from.language_code).symbol,
		keyboard: (msg) =>
			keyboardWrapper([], {
				language_code: msg.from.language_code,
			}),
		validate: async ({ text }) => {
			try {
				const res = await futuresApi.getPairIndex(text.toUpperCase());
				return !!res.data;
			} catch {
				return false;
			}
		},
		onAnswer: async (msg) => {
			history[msg.chat.id] = {
				chatId: msg.chat.id,
				symbol: msg.text.toUpperCase(),
			};
		},
		errorText: (msg) => dictionary(msg.from.language_code).pairNotExists,
		getPrev: () => DICT.default.CHOOSE_PAIR_FUNC,
		getNext: () => DICT.creation.CHOOSE_TRADE_TYPE,
	},
	[DICT.creation.CHOOSE_TRADE_TYPE]: {
		id: 'CHOOSE_TRADE_TYPE',
		text: (msg) => dictionary(msg.from.language_code).sendMessageWhen,
		expects: (msg) => [
			dictionary(msg.from.language_code).above,
			dictionary(msg.from.language_code).below,
			dictionary(msg.from.language_code).spiking,
		],
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).above,
						},
						{
							text: dictionary(msg.from.language_code).below,
						},
					],
					[
						{
							text: dictionary(msg.from.language_code).spiking,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		onAnswer: async (msg) => {
			const type = {
				[dictionary(msg.from.language_code).above]: 'ABOVE',
				[dictionary(msg.from.language_code).below]: 'BELOW',
				[dictionary(msg.from.language_code).spiking]: 'SPIKE',
			}[msg.text];
			history[msg.chat.id].type = type;
			if (msg.text === dictionary(msg.from.language_code).spiking) {
				await pairApi.createPair(history[msg.chat.id]);
				await updateStorage();
				Subscription(history[msg.chat.id].symbol);
				await get(BOT_MESSANGER)(
					msg.chat.id,
					dictionary(msg.from.language_code).pairSuccessfullyCreated
				);
				delete history[msg.chat.id];
			}
		},
		getPrev: () => DICT.creation.ADD_OBSERVER,
		getNext: (msg) => {
			if (msg.text !== dictionary(msg.from.language_code).spiking) {
				return DICT.creation.SET_PRICE;
			}
			return DICT.default.CHOOSE_PAIR_FUNC;
		},
	},
	[DICT.creation.SET_PRICE]: {
		id: 'SET_PRICE',
		text: (msg) => dictionary(msg.from.language_code).enterAlertPrice,
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
		errorText: (msg) => dictionary(msg.from.language_code).alertPriceError,
		keyboard: (msg) =>
			keyboardWrapper([], {
				language_code: msg.from.language_code,
			}),
		onAnswer: async (msg) => {
			history[msg.chat.id].price = Number(msg.text);
		},
		getPrev: () => DICT.creation.CHOOSE_TRADE_TYPE,
		getNext: () => DICT.creation.SET_MESSAGE,
	},
	[DICT.creation.SET_MESSAGE]: {
		id: 'SET_MESSAGE',
		text: (msg) => dictionary(msg.from.language_code).messageTemplate,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					dictionary(msg.from.language_code).messageTemplates.map((item) => ({
						text: item,
					})),
				],
				{
					language_code: msg.from.language_code,
				}
			),
		onAnswer: async (msg) => {
			history[msg.chat.id].message = msg.text;
			await pairApi.createPair(history[msg.chat.id]);
			await updateStorage();
			Subscription(history[msg.chat.id].symbol);
			await get(BOT_MESSANGER)(
				msg.chat.id,
				dictionary(msg.from.language_code).pairSuccessfullyCreated
			);
			delete history[msg.chat.id];
		},
		getPrev: () => DICT.creation.SET_PRICE,
		getNext: () => DICT.default.CHOOSE_PAIR_FUNC,
	},
};
