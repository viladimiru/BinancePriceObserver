import axios from 'axios';
import pairApi from '../api/pairApi.js';
import { ABOVE, BELOW, TO_THE_MAIN } from '../textDictionary.js';
import { updateStorage, Subscription } from '../subscription.js';
import { keyboardWrapper } from '../utils/keyboard.js';

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
		text: 'Название пары (к примеру BTCUSDT)',
		keyboard: keyboardWrapper(),
		validate: async ({text}) => {
			try {
				const res = await axios.get('https://api.binance.com/api/v3/avgPrice', {
					params: {
						symbol: text,
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
					symbol: msg.text,
				},
				msg.chat.id
			);
		},
		errorText: 'Такой пары не существует',
		getNext: () => DICTIONARY.CHOOSE_TRADE_TYPE
	},
	[DICTIONARY.CHOOSE_TRADE_TYPE]: {
		id: 'CHOOSE_TRADE_TYPE',
		text: 'Прислать сообщение когда цена будет выше/ниже',
		expects: [ABOVE, BELOW],
		keyboard: keyboardWrapper([
			[
				{
					text: ABOVE,
				},
				{
					text: BELOW,
				},
			],
		]),
		onAnswer: async (msg) => {
			await pairApi.updateTempPairByChatId(
				{
					type: msg.text === ABOVE ? 'ABOVE' : 'BELOW',
				},
				msg.chat.id
			);
		},
		getPrev: () => DICTIONARY.ADD_OBSERVER,
		getNext: () => DICTIONARY.SET_PRICE,
	},
	[DICTIONARY.SET_PRICE]: {
		id: 'SET_PRICE',
		text: 'Введите сумму, после которой хотите получить уведомление',
		validate: ({text}) => {
			return !isNaN(Number(text));
		},
		errorText: 'Вводите только цифры (15000.00)',
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
		text: 'Напишите сообщение, которое хотите получить',
		keyboard: keyboardWrapper([
			[
				{
					text: '🚨🚨🚨 STOP LOSS 🚨🚨🚨'
				},
				{
					text: '🤑🤑🤑 TAKE PROFIT 🤑🤑🤑'
				},
			]
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
		text: 'Пара успешно добавлена',
		keyboard: keyboardWrapper(
			[
				[
					{
						text: TO_THE_MAIN,
					},
				],
			],
			null,
			true
		),
	}
};
