import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/index.js';
import axios from 'axios';
import pairApi from '../api/pairApi.js';

export const DICTIONARY = {
  SYMBOL: 'TRADE_SYMBOL',
	TYPE: 'TRADE_TYPE',
  PRICE: 'TRADE_PRICE',
  FINISH: 'TRADE_FINISH',
  SHOULDER: 'TRADE_SHOULDER'
};

export default {
	[DICTIONARY.SYMBOL]: {
		id: DICTIONARY.SYMBOL,
		text: dict.symbol,
		keyboard: keyboardWrapper(),
		validate: async ({ text }) => {
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
      await pairApi.setTempTradeByChatId({
        chatId: msg.chat.id,
        symbol: msg.text.toUpperCase()
      }, msg.chat.id)
		},
		errorText: dict.pairNotExists,
		getNext: () => DICTIONARY.TYPE,
	},
	[DICTIONARY.TYPE]: {
		id: DICTIONARY.TYPE,
		text: dict.tradeType,
		keyboard: keyboardWrapper([
			[
				{
					text: dict.long,
				},
				{
					text: dict.short,
				},
			],
		]),
		expect: [dict.long, dict.short],
    onAnswer: async (msg) => {
      await pairApi.setTempTradeByChatId({
        type: msg.text.toUpperCase()
      }, msg.chat.id)
    },
		getNext: () => DICTIONARY.PRICE,
		getPrev: () => DICTIONARY.SYMBOL,
	},
	[DICTIONARY.PRICE]: {
		id: DICTIONARY.PRICE,
		text: dict.tradePrice,
		keyboard: keyboardWrapper(),
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
      await pairApi.setTempTradeByChatId({
        markPrice: Number(msg.text)
      }, msg.chat.id)
    },
		getNext: () => DICTIONARY.SHOULDER,
		getPrev: () => DICTIONARY.TYPE,
	},
	[DICTIONARY.SHOULDER]: {
		id: DICTIONARY.SHOULDER,
		text: dict.shoulder,
		keyboard: keyboardWrapper(),
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
      await pairApi.setTempTradeByChatId({
        shoulder: Number(msg.text)
      }, msg.chat.id)
			const trade = await pairApi.getTempTradeByChatId(msg.chat.id);
			await pairApi.createTrade(trade);
			await pairApi.deleteTempTradeByChatId(msg.chat.id);
    },
		getNext: () => DICTIONARY.FINISH,
		getPrev: () => DICTIONARY.PRICE,
	},
	[DICTIONARY.FINISH]: {
		id: DICTIONARY.FINISH,
		text: dict.tradeCreated,
		keyboard: keyboardWrapper([
			[
				{
					text: dict.toTheMain
				}
			]
		], {}, true),
		getNext: () => DICTIONARY.START,
		getPrev: () => DICTIONARY.PRICE,
	},
};
