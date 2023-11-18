import { keyboardWrapper } from '../../utils/keyboard.js';
import { diffInPercents, toFixed } from '../../utils/number.js';
import emoji from '../../dictionary/emoji.js';
import { dictionary } from '../../dictionary/index.js';
import { apiClient } from '../../api/index.js';
import { Bot, type BotMessage } from '../index';
import { type GetChatTradesByPairs } from '../../../../shared/models/trade.js';
import { type FuturePrice } from '../../../../shared/models/future.js';

type ExpandedTradeEntity = Awaited<ReturnType<GetChatTradesByPairs>>[number] & {
	isWin: boolean;
	isLoss: boolean;
};

export const DICTIONARY = {
	QUOTES: 'QUOTES',
};

export default {
	[DICTIONARY.QUOTES]: {
		id: 'QUOTES',
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).loadingQuotes,
		keyboard: (message: BotMessage) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(message.from.language_code).update,
						},
					],
				],
				{
					language_code: message.from.language_code,
				}
			),
		expect: (message: BotMessage) => [
			dictionary(message.from.language_code).update,
		],
		cbOnSend: async (message: BotMessage) => {
			try {
				// todo: CONTROLLER GET /getQuotes
				const result = await apiClient.getChatPairPrices({
					chatId: message.chat.id,
				});
				if (result) {
					const trades = await apiClient.getChatTradesByPairs({
						pairs: result.map((item) => item.symbol),
					});
					let text = '';
					result.forEach((item) => {
						text += [`<b>${item.symbol}</b>`, toFixed(item.markPrice)].join(
							': '
						);
						text += '<i>';
						const _trades = transformTrades(trades, item);
						_trades.forEach((trade) => {
							text += wrapTradeText(
								item.markPrice,
								trade,
								message.from.language_code
							);
						});
						text += '</i>';
						text += '\n';
					});
					await Bot.sendMessage(message.chat.id, text, {
						parse_mode: 'HTML',
					});
				} else {
					await Bot.sendMessage(
						message.chat.id,
						dictionary(message.from.language_code).listIsEmpty
					);
				}
			} catch (error) {
				console.log(error);
				await Bot.sendMessage(
					message.chat.id,
					dictionary(message.from.language_code).quotesFetchError
				);
			}
		},
		getNext: (message: BotMessage) =>
			message.text === dictionary(message.from.language_code).update
				? DICTIONARY.QUOTES
				: 'START',
	},
};

function wrapTradeText(
	markPrice: number,
	trade: ExpandedTradeEntity,
	language: string
): string {
	let text = '\n';
	text += [trade.type, ' | '].join('');
	if (trade.isWin) {
		text += emoji.above;
	} else if (trade.isLoss) {
		text += emoji.belowRed;
	}
	const diff = diffInPercents(trade.markPrice, markPrice) * trade.shoulder;
	if (diff) {
		text += toFixed(String(Math.abs(diff))) + '%';
		text += ' | ';
	}
	text += dictionary(language).entry + ': ' + trade.markPrice;
	return text;
}

function transformTrades(
	trades: Awaited<ReturnType<GetChatTradesByPairs>>,
	pair: FuturePrice
): ExpandedTradeEntity[] {
	const result = trades
		.filter((trade) => trade.Pair.symbol === pair.symbol)
		.map((trade) => {
			const diff =
				diffInPercents(trade.markPrice, pair.markPrice) * trade.shoulder;
			const isWin =
				(trade.type === 'LONG' && diff > 0) ||
				(trade.type === 'SHORT' && diff < 0);
			const isLoss =
				(trade.type === 'LONG' && diff < 0) ||
				(trade.type === 'SHORT' && diff > 0);
			return {
				...trade,
				isWin,
				isLoss,
			};
		})
		.sort((a) => {
			const diff = diffInPercents(a.markPrice, pair.markPrice) * a.shoulder;
			const isWin =
				(a.type === 'LONG' && diff > 0) || (a.type === 'SHORT' && diff < 0);
			const isLoss =
				(a.type === 'LONG' && diff < 0) || (a.type === 'SHORT' && diff > 0);
			a.isWin = isWin;
			a.isLoss = isLoss;
			if (isWin) return -1;
			else return 0;
		});
	return result as ExpandedTradeEntity[];
}
