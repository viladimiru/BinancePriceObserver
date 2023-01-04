import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js';
import tradeApi from '../api/tradeApi.js'
import { BOT_MESSANGER, get } from '../storage/index.js';
import futuresApi from '../api/futuresApi.js';
import priceApi from '../api/priceApi.js';
import { Subscription, updateStorage } from '../subscription.js';
import spikeApi from '../api/spikeApi.js';

export const DICTIONARY = {
  SYMBOL: 'TRADE_SYMBOL',
	TYPE: 'TRADE_TYPE',
  PRICE: 'TRADE_PRICE',
  FINISH: 'TRADE_FINISH',
  SHOULDER: 'TRADE_SHOULDER',
  STOP_LOSS: 'TRADE_STOP_LOSS',
  TAKE_PROFIT: 'TRADE_TAKE_PROFIT',
	SPIKING: 'TRADE_SPIKING'
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
		expects: [dict.long, dict.short],
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
		errorText: dict.alertPriceError,
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
		errorText: dict.enterOnlyNumbers,
		keyboard: keyboardWrapper(),
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
			history[msg.chat.id].shoulder = Number(msg.text)
    },
		getPrev: () => DICTIONARY.PRICE,
		getNext: () => DICTIONARY.TAKE_PROFIT
	},
	[DICTIONARY.TAKE_PROFIT]: {
		id: DICTIONARY.TAKE_PROFIT,
		text: dict.takeProfitIfExist,
		errorText: dict.alertPriceError,
		keyboard: keyboardWrapper([
			[
				{
					text: dict.miss
				}
			]
		]),
		validate: ({ text }) => {
			return text === dict.miss || !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
			if (msg.text !== dict.miss) {
				history[msg.chat.id].takeProfit = Number(msg.text)
			}
    },
		getPrev: () => DICTIONARY.SHOULDER,
		getNext: () => DICTIONARY.STOP_LOSS
	},
	[DICTIONARY.STOP_LOSS]: {
		id: DICTIONARY.STOP_LOSS,
		text: dict.stopLossIfExist,
		errorText: dict.alertPriceError,
		keyboard: keyboardWrapper([
			[
				{
					text: dict.miss
				}
			]
		]),
		validate: ({ text }) => {
			return text === dict.miss || !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
			if (msg.text !== dict.miss) {
				history[msg.chat.id].stopLoss = Number(msg.text)
			}
    },
		getPrev: () => DICTIONARY.TAKE_PROFIT,
		getNext: () => DICTIONARY.SPIKING
	},
	[DICTIONARY.SPIKING]: {
		id: DICTIONARY.SPIKING,
		text: dict.spikingIfNeeded,
		keyboard: keyboardWrapper([
			[
				{
					text: dict.yes
				},
				{
					text: dict.miss
				}
			]
		]),
		expects: [
			dict.miss,
			dict.yes
		],
    onAnswer: async (msg) => {
			if (msg.text !== dict.miss) {
				history[msg.chat.id].spiking = true
			}
			const payload = history[msg.chat.id]
			await tradeApi.createTrade(payload);

			if (payload.stopLoss) {
				await priceApi.createPriceWithSymbol(
					msg.chat.id,
					dict.messageTemplates[0],
					payload.type === dict.long.toUpperCase() ? 'BELOW' : 'ABOVE',
					payload.stopLoss,
					payload.symbol
				)
				Subscription(payload.symbol);
			}

			if (payload.takeProfit) {
				await priceApi.createPriceWithSymbol(
					msg.chat.id,
					dict.messageTemplates[1],
					payload.type === dict.short.toUpperCase() ? 'BELOW' : 'ABOVE',
					payload.takeProfit,
					payload.symbol
				)
				Subscription(payload.symbol);
			}

			if (payload.spiking) {
				await spikeApi.createSpikeWithSymbol(
					msg.chat.id,
					payload.symbol,
				)
				Subscription(payload.symbol);
			}

			if (payload.stopLoss || payload.takeProfit) {
				await updateStorage();
			}

			await get(BOT_MESSANGER)(msg.chat.id, dict.tradeCreated, {
				parse_mode: 'html'
			})
			delete history[msg.chat.id]
    },
		getPrev: () => DICTIONARY.STOP_LOSS,
	},
};
