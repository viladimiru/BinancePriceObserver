import axios from 'axios';
import pairApi from '../api/pairApi.js';
import { updateStorage, Subscription } from '../subscription.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/index.js'

export const DICTIONARY = {
	ADD_OBSERVER: 'ADD_OBSERVER',
	CHOOSE_TRADE_TYPE: 'CHOOSE_TRADE_TYPE',
	SET_PRICE: 'SET_PRICE',
	SET_MESSAGE: 'SET_MESSAGE',
	FINISH: 'FINISH',
}

export default {
	[DICTIONARY.ADD_OBSERVER]: {
		id: 'ADD_OBSERVER',
		text: dict.symbol,
		keyboard: keyboardWrapper(),
		validate: async ({text}) => {
			try {
				const res = await axios.get('https://api.binance.com/api/v3/avgPrice', {
					params: {
						symbol: text.toUpperCase(),
					},
				});
				return !!res.data;
			} catch {
				return false;
			}
		},
		onAnswer: async (msg) => {
			await pairApi.setTempPairByChatId(
				{
					chatId: msg.chat.id,
					symbol: msg.text.toUpperCase(),
				},
				msg.chat.id
			);
		},
		errorText: dict.pairNotExists,
		getNext: () => DICTIONARY.CHOOSE_TRADE_TYPE
	},
	[DICTIONARY.CHOOSE_TRADE_TYPE]: {
		id: 'CHOOSE_TRADE_TYPE',
		text: dict.sendMessageWhen,
		expects: [dict.above, dict.below],
		keyboard: keyboardWrapper([
			[
				{
					text: dict.above,
				},
				{
					text: dict.below,
				},
			],
		]),
		onAnswer: async (msg) => {
			await pairApi.updateTempPairByChatId(
				{
					type: msg.text === dict.above ? 'ABOVE' : 'BELOW',
				},
				msg.chat.id
			);
		},
		getPrev: () => DICTIONARY.ADD_OBSERVER,
		getNext: () => DICTIONARY.SET_PRICE,
	},
	[DICTIONARY.SET_PRICE]: {
		id: 'SET_PRICE',
		text: dict.enterAlertPrice,
		validate: ({text}) => {
			return !isNaN(Number(text));
		},
		errorText: dict.alertPriceError,
		keyboard: keyboardWrapper(),
		onAnswer: async (msg) => {
			await pairApi.updateTempPairByChatId(
				{
					price: Number(msg.text),
				},
				msg.chat.id
			);
		},
		getPrev: () => DICTIONARY.CHOOSE_TRADE_TYPE,
		getNext: () => DICTIONARY.SET_MESSAGE,
	},
	[DICTIONARY.SET_MESSAGE]: {
		id: 'SET_MESSAGE',
		text: dict.messageTemplate,
		keyboard: keyboardWrapper([
			dict.messageTemplates.map(item => ({
				text: item
			}))
		]),
		onAnswer: async (msg) => {
			await pairApi.updateTempPairByChatId(
				{
					message: msg.text,
				},
				msg.chat.id
			);
			const pair = await pairApi.getTempPairByChatId(msg.chat.id);
			await pairApi.createPair(pair);
			await updateStorage();
			Subscription(pair.symbol);
			await pairApi.deleteTempPairByChatId(msg.chat.id);
		},
		getPrev: () => DICTIONARY.SET_PRICE,
		getNext: () => DICTIONARY.FINISH,
	},
	[DICTIONARY.FINISH]: {
		id: 'FINISH',
		text: dict.pairSuccessfullyCreated,
		keyboard: keyboardWrapper(
			[
				[
					{
						text: dict.toTheMain,
					},
				],
			],
			null,
			true
		),
	}
};