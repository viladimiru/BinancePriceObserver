import {
	ADD_OBSERVER,
	REMOVE_OBSERVER,
	LONG,
	SHORT,
} from './textDictionary.js';
import axios from 'axios';
import pairApi from './api/pairApi.js';
import { updateStorage, Subscription } from './subscription.js';

export const DICTIONARY = {
	START: {
		id: 'START',
		text: ['<b>Добро пожаловать</b>', 'Выберите нужную функцию'].join('\n\n'),
		expects: [ADD_OBSERVER, REMOVE_OBSERVER],
	},
	ADD_OBSERVER: {
		id: 'ADD_OBSERVER',
		text: 'Название пары (к примеру BTCUSDT)',
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
	},
	CHOOSE_TRADE_TYPE: {
		id: 'CHOOSE_TRADE_TYPE',
		text: 'Выберите тип сделки',
		expects: [LONG, SHORT],
		onAnswer: async (msg) => {
			await pairApi.updateTempPairByChatId(
				{
					type: msg.text,
				},
				msg.chat.id
			);
		},
	},
	SET_PRICE: {
		id: 'SET_PRICE',
		text: 'Введите сумму, после которой хотите получить уведомление',
		validate: ({text}) => {
			return !isNaN(Number(text));
		},
		errorText: 'Вводите только цифры (15000.00)',
		onAnswer: async (msg) => {
			await pairApi.updateTempPairByChatId(
				{
					price: Number(msg.text),
				},
				msg.chat.id
			);
			const pair = await pairApi.getTempPairByChatId(msg.chat.id)
      await pairApi.createPair(pair)
			await updateStorage()
			Subscription(pair.symbol)
      await pairApi.deleteTempPairByChatId(msg.chat.id)
		},
	},
	FINISH: {
		id: 'FINISH',
		text: 'Пара успешно добавлена',
	},
};

export function getNextStep(step) {
	const dictionaryArr = Object.keys(DICTIONARY);
	const index = dictionaryArr.findIndex((key) => key === step);
	return dictionaryArr[index + 1] || dictionaryArr[0];
}

export function getPrevStep(step) {
	const dictionaryArr = Object.keys(DICTIONARY);
	const index = dictionaryArr.findIndex((key) => key === step);
	return dictionaryArr[index - 1] || dictionaryArr[0];
}
