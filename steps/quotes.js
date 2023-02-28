import { keyboardWrapper } from '../utils/keyboard.js';
import pairApi from '../api/pairApi.js';
import tradeApi from '../api/tradeApi.js';
import { diffInPercents, toFixed } from '../utils/number.js';
import emoji from '../dict/emoji.js';
import { get, BOT_MESSANGER } from '../storage/index.js';
import { dictionary } from '../dict/index.js';

export const DICTIONARY = {
	QUOTES: 'QUOTES',
};

export default {
	[DICTIONARY.QUOTES]: {
		id: 'QUOTES',
		text: (msg) => dictionary(msg.from.language_code).loadingQuotes,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).update,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		expect: (msg) => [dictionary(msg.from.language_code).update],
		cbOnSend: async (msg) => {
			try {
				const result = await pairApi.getChatPairPrices(msg.chat.id);
				if (result) {
					const trades = await tradeApi.getChatTradesByPairs(
						result.map((item) => item.symbol)
					);
					let text = '';
					result.forEach((item) => {
						text += [
							`<b>${item.symbol}</b>`,
							toFixed(Number(item.markPrice)),
						].join(': ');
						text += '<i>';
						const _trades = transformTrades(trades, item);
						_trades.forEach((trade) => {
							text += wrapTradeText(
								item.markPrice,
								trade,
								msg.from.language_code
							);
						});
						text += '</i>';
						text += '\n';
					});
					await get(BOT_MESSANGER)(msg.chat.id, text, {
						parse_mode: 'html',
					});
				} else {
					await get(BOT_MESSANGER)(
						msg.chat.id,
						dictionary(msg.from.language_code).listIsEmpty
					);
				}
			} catch {
				await get(BOT_MESSANGER)(
					msg.chat.id,
					dictionary(msg.from.language_code).quotesFetchError
				);
			}
		},
		getNext: (msg) =>
			msg.text === dictionary(msg.from.language_code).update
				? DICTIONARY.QUOTES
				: 'START',
	},
};

function wrapTradeText(markPrice, trade, language) {
	let text = '\n';
	text += [trade.type, ' | '].join('');
	if (trade.isWin) {
		text += emoji.above;
	} else if (trade.isLoss) {
		text += emoji.belowRed;
	}
	const diff = diffInPercents(trade.markPrice, markPrice) * trade.shoulder;
	if (diff) {
		text += toFixed(Math.abs(diff)) + '%';
		text += ' | ';
	}
	text += dictionary(language).entry + ': ' + trade.markPrice;
	return text;
}

function transformTrades(trades, pair) {
	return trades
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
			trade.isWin = isWin;
			trade.isLoss = isLoss;
			return trade;
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
}
