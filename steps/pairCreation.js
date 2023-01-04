import pairApi from '../api/pairApi.js';
import { updateStorage, Subscription } from '../subscription.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js';
import { BOT_MESSANGER, get } from '../storage/index.js';
import futuresApi from '../api/futuresApi.js';

export const DICTIONARY = {
	ADD_OBSERVER: 'ADD_OBSERVER',
	CHOOSE_TRADE_TYPE: 'CHOOSE_TRADE_TYPE',
	SET_PRICE: 'SET_PRICE',
	SET_TRADE_PRICE: 'SET_TRADE_PRICE',
	SET_MESSAGE: 'SET_MESSAGE',
	FINISH: 'FINISH',
};

const history = {}

export default {
	[DICTIONARY.ADD_OBSERVER]: {
		id: 'ADD_OBSERVER',
		text: dict.symbol,
		keyboard: keyboardWrapper(),
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
				symbol: msg.text.toUpperCase()
			}
		},
		errorText: dict.pairNotExists,
		getNext: () => DICTIONARY.CHOOSE_TRADE_TYPE,
	},
	[DICTIONARY.CHOOSE_TRADE_TYPE]: {
		id: 'CHOOSE_TRADE_TYPE',
		text: dict.sendMessageWhen,
		expects: [dict.above, dict.below, dict.spiking],
		keyboard: keyboardWrapper([
			[
				{
					text: dict.above,
				},
				{
					text: dict.below,
				},
			],
			[
				{
					text: dict.spiking,
				},
			],
		]),
		onAnswer: async (msg) => {
			const type = {
				[dict.above]: 'ABOVE',
				[dict.below]: 'BELOW',
				[dict.spiking]: 'SPIKE',
			}[msg.text];
			history[msg.chat.id].type = type
			if (msg.text === dict.spiking) {
				await pairApi.createPair(history[msg.chat.id]);
				await updateStorage();
				Subscription(history[msg.chat.id].symbol);
				await get(BOT_MESSANGER)(msg.chat.id, dict.pairSuccessfullyCreated)
				delete history[msg.chat.id]
			}
		},
		getPrev: () => DICTIONARY.ADD_OBSERVER,
		getNext: (msg) => {
			if (msg.text !== dict.spiking) {
				return DICTIONARY.SET_PRICE;
			}
		},
	},
	[DICTIONARY.SET_PRICE]: {
		id: 'SET_PRICE',
		text: dict.enterAlertPrice,
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
		errorText: dict.alertPriceError,
		keyboard: keyboardWrapper(),
		onAnswer: async (msg) => {
			history[msg.chat.id].price = Number(msg.text)
		},
		getPrev: () => DICTIONARY.CHOOSE_TRADE_TYPE,
		getNext: () => DICTIONARY.SET_MESSAGE,
	},
	[DICTIONARY.SET_MESSAGE]: {
		id: 'SET_MESSAGE',
		text: dict.messageTemplate,
		keyboard: keyboardWrapper([
			dict.messageTemplates.map((item) => ({
				text: item,
			})),
		]),
		onAnswer: async (msg) => {
			history[msg.chat.id].message = msg.text
			await pairApi.createPair(history[msg.chat.id]);
			await updateStorage();
			Subscription(history[msg.chat.id].symbol);
			await get(BOT_MESSANGER)(msg.chat.id, dict.pairSuccessfullyCreated)
			delete history[msg.chat.id]
		},
		getPrev: () => DICTIONARY.SET_PRICE,
	},
};
