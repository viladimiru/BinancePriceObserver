import { keyboardWrapper } from '../../utils/keyboard.js';
import dict from '../../dict/lang/index.js';
import tradeApi from '../../api/tradeApi.js'
import { BOT_MESSANGER, get } from '../../storage/index.js';
import futuresApi from '../../api/futuresApi.js';
import priceApi from '../../api/priceApi.js';
import { Subscription, updateStorage } from '../../subscription.js';
import spikeApi from '../../api/spikeApi.js';
import DICT from './dict.js';

const history = {}

export default {
	[DICT.creation.SYMBOL]: {
		id: DICT.creation.SYMBOL,
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
		getPrev: () => DICT.default.CHOOSE_TRADE_FUNC,
		getNext: () => DICT.creation.TYPE,
	},
	[DICT.creation.TYPE]: {
		id: DICT.creation.TYPE,
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
		getNext: () => DICT.creation.PRICE,
		getPrev: () => DICT.creation.SYMBOL,
	},
	[DICT.creation.PRICE]: {
		id: DICT.creation.PRICE,
		text: dict.tradePrice,
		keyboard: keyboardWrapper(),
		errorText: dict.alertPriceError,
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
			history[msg.chat.id].markPrice = Number(msg.text)
    },
		getNext: () => DICT.creation.SHOULDER,
		getPrev: () => DICT.creation.TYPE,
	},
	[DICT.creation.SHOULDER]: {
		id: DICT.creation.SHOULDER,
		text: dict.shoulder,
		errorText: dict.enterOnlyNumbers,
		keyboard: keyboardWrapper(),
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
    onAnswer: async (msg) => {
			history[msg.chat.id].shoulder = Number(msg.text)
    },
		getPrev: () => DICT.creation.PRICE,
		getNext: () => DICT.creation.TAKE_PROFIT
	},
	[DICT.creation.TAKE_PROFIT]: {
		id: DICT.creation.TAKE_PROFIT,
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
		getPrev: () => DICT.creation.SHOULDER,
		getNext: () => DICT.creation.STOP_LOSS
	},
	[DICT.creation.STOP_LOSS]: {
		id: DICT.creation.STOP_LOSS,
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
		getPrev: () => DICT.creation.TAKE_PROFIT,
		getNext: () => DICT.creation.SPIKING
	},
	[DICT.creation.SPIKING]: {
		id: DICT.creation.SPIKING,
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
		getPrev: () => DICT.creation.STOP_LOSS,
		getNext: () => DICT.default.CHOOSE_TRADE_FUNC
	},
};
