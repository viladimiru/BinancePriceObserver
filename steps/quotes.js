import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js';
import pairApi from '../api/pairApi.js';
import tradeApi from '../api/tradeApi.js';
import { diffInPercents, toFixed } from '../utils/number.js';
import emoji from '../dict/emoji.js';
import { get, BOT_MESSANGER } from '../storage/index.js';

export const DICTIONARY = {
	QUOTES: 'QUOTES',
};

export default {
	[DICTIONARY.QUOTES]: {
		id: 'QUOTES',
		text: dict.loadingQuotes,
		keyboard: keyboardWrapper([
			[
				{
					text: dict.update,
				},
			],
		]),
		expect: [dict.update],
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
							text += wrapTradeText(item.markPrice, trade);
						});
						text += '</i>';
						text += '\n';
					});
					await get(BOT_MESSANGER)(msg.chat.id, text, {
						parse_mode: 'html',
					});
				} else {
					await get(BOT_MESSANGER)(msg.chat.id, dict.listIsEmpty);
				}
			} catch {
				await get(BOT_MESSANGER)(msg.chat.id, dict.quotesFetchError);
			}
		},
		getNext: (msg) => (msg.text === dict.update ? DICTIONARY.QUOTES : 'START'),
	},
};

function wrapTradeText(markPrice, trade) {
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
	text += 'Вход: ' + trade.markPrice;
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
