import { keyboardWrapper } from '../../utils/keyboard.js';
import tradeApi from '../../api/tradeApi.js';
import { BOT_MESSANGER, get } from '../../storage/index.js';
import futuresApi from '../../api/futuresApi.js';
import priceApi from '../../api/priceApi.js';
import { Subscription, updateStorage } from '../../subscription.js';
import spikeApi from '../../api/spikeApi.js';
import DICT from './dict.js';
import { dictionary } from '../../dict/index.js';
import { sendMessage } from '../../services/chat.js';

const history = {};

export default {
	[DICT.creation.SYMBOL]: {
		id: DICT.creation.SYMBOL,
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
		getPrev: () => DICT.default.CHOOSE_TRADE_FUNC,
		getNext: () => DICT.creation.TYPE,
	},
	[DICT.creation.TYPE]: {
		id: DICT.creation.TYPE,
		text: (msg) => dictionary(msg.from.language_code).tradeType,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).long,
						},
						{
							text: dictionary(msg.from.language_code).short,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		expects: (msg) => [
			dictionary(msg.from.language_code).long,
			dictionary(msg.from.language_code).short,
		],
		onAnswer: async (msg) => {
			history[msg.chat.id].type = msg.text.toUpperCase();
		},
		getNext: () => DICT.creation.PRICE,
		getPrev: () => DICT.creation.SYMBOL,
	},
	[DICT.creation.PRICE]: {
		id: DICT.creation.PRICE,
		text: (msg) => dictionary(msg.from.language_code).tradePrice,
		keyboard: (msg) =>
			keyboardWrapper([], {
				language_code: msg.from.language_code,
			}),
		errorText: (msg) => dictionary(msg.from.language_code).alertPriceError,
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
		onAnswer: async (msg) => {
			history[msg.chat.id].markPrice = Number(msg.text);
		},
		getNext: () => DICT.creation.SHOULDER,
		getPrev: () => DICT.creation.TYPE,
	},
	[DICT.creation.SHOULDER]: {
		id: DICT.creation.SHOULDER,
		text: (msg) => dictionary(msg.from.language_code).shoulder,
		errorText: (msg) => dictionary(msg.from.language_code).enterOnlyNumbers,
		keyboard: (msg) =>
			keyboardWrapper([], {
				language_code: msg.from.language_code,
			}),
		validate: ({ text }) => {
			return !isNaN(Number(text));
		},
		onAnswer: async (msg) => {
			history[msg.chat.id].shoulder = Number(msg.text);
		},
		getPrev: () => DICT.creation.PRICE,
		getNext: () => DICT.creation.TAKE_PROFIT,
	},
	[DICT.creation.TAKE_PROFIT]: {
		id: DICT.creation.TAKE_PROFIT,
		text: (msg) => dictionary(msg.from.language_code).takeProfitIfExist,
		errorText: (msg) => dictionary(msg.from.language_code).alertPriceError,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).miss,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		validate: (msg) => {
			return (
				msg.text === dictionary(msg.from.language_code).miss ||
				!isNaN(Number(msg.text))
			);
		},
		onAnswer: async (msg) => {
			if (msg.text !== dictionary(msg.from.language_code).miss) {
				history[msg.chat.id].takeProfit = Number(msg.text);
			}
		},
		getPrev: () => DICT.creation.SHOULDER,
		getNext: () => DICT.creation.STOP_LOSS,
	},
	[DICT.creation.STOP_LOSS]: {
		id: DICT.creation.STOP_LOSS,
		text: (msg) => dictionary(msg.from.language_code).stopLossIfExist,
		errorText: (msg) => dictionary(msg.from.language_code).alertPriceError,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).miss,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		validate: ({ text, from: { language_code } }) => {
			return text === dictionary(language_code).miss || !isNaN(Number(text));
		},
		onAnswer: async (msg) => {
			if (msg.text !== dictionary(msg.from.language_code).miss) {
				history[msg.chat.id].stopLoss = Number(msg.text);
			}
		},
		getPrev: () => DICT.creation.TAKE_PROFIT,
		getNext: () => DICT.creation.SPIKING,
	},
	[DICT.creation.SPIKING]: {
		id: DICT.creation.SPIKING,
		text: (msg) => dictionary(msg.from.language_code).spikingIfNeeded,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).yes,
						},
						{
							text: dictionary(msg.from.language_code).miss,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		expects: (msg) => [
			dictionary(msg.from.language_code).miss,
			dictionary(msg.from.language_code).yes,
		],
		onAnswer: async (msg) => {
			if (msg.text !== dictionary(msg.from.language_code).miss) {
				history[msg.chat.id].spiking = true;
			}
			const payload = history[msg.chat.id];
			await tradeApi.createTrade(payload);

			if (payload.stopLoss) {
				await priceApi.createPriceWithSymbol(
					msg.chat.id,
					dictionary(msg.from.language_code).messageTemplates[0],
					payload.type === dictionary(msg.from.language_code).long.toUpperCase()
						? 'BELOW'
						: 'ABOVE',
					payload.stopLoss,
					payload.symbol
				);
			}

			if (payload.takeProfit) {
				await priceApi.createPriceWithSymbol(
					msg.chat.id,
					dictionary(msg.from.language_code).messageTemplates[1],
					payload.type ===
						dictionary(msg.from.language_code).short.toUpperCase()
						? 'BELOW'
						: 'ABOVE',
					payload.takeProfit,
					payload.symbol
				);
			}

			if (payload.spiking) {
				await spikeApi.createSpikeWithSymbol(msg.chat.id, payload.symbol);
			}

			if (payload.stopLoss || payload.takeProfit || payload.spiking) {
				await updateStorage();
				Subscription(payload.symbol);
			}

			await sendMessage(
				msg.chat.id,
				dictionary(msg.from.language_code).tradeCreated,
				{
					parse_mode: 'html',
				}
			);
			delete history[msg.chat.id];
		},
		getPrev: () => DICT.creation.STOP_LOSS,
		getNext: () => DICT.default.CHOOSE_TRADE_FUNC,
	},
};
