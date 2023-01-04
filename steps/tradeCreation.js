import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js';
import tradeApi from '../api/tradeApi.js'
import { BOT_MESSANGER, get } from '../storage/index.js';
import futuresApi from '../api/futuresApi.js';

export const DICTIONARY = {
  SYMBOL: 'TRADE_SYMBOL',
	TYPE: 'TRADE_TYPE',
  PRICE: 'TRADE_PRICE',
  FINISH: 'TRADE_FINISH',
  SHOULDER: 'TRADE_SHOULDER'
};

const history = {}

export default {
	[DICTIONARY.SYMBOL]: {
		id: DICTIONARY.SYMBOL,
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
			history[msg.chat.id].type = msg.text.toUpperCase()
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
			history[msg.chat.id].markPrice = Number(msg.text)
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
			history[msg.chat.id].shoulder = Number(msg.text)
			await tradeApi.createTrade(history[msg.chat.id]);
			await get(BOT_MESSANGER)(msg.chat.id, dict.tradeCreated, {
				parse_mode: 'html'
			})
			delete history[msg.chat.id]
    },
		getPrev: () => DICTIONARY.PRICE,
	},
};
