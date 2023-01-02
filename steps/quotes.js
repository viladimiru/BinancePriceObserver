import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/index.js';
import eventBus from '../utils/eventBus.js';
import pairApi from '../api/pairApi.js';
import { diffInPercents, toFixed } from '../utils/number.js';

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
			const result = await pairApi.getChatPairPrices(msg.chat.id);
			if (result) {
				const trades = await pairApi.getChatTradesByPairs(
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
				eventBus.emit('sendMessage', null, msg.chat.id, text, {
					parse_mode: 'html',
				});
			} else {
				eventBus.emit('sendMessage', null, msg.chat.id, dict.listIsEmpty);
			}
		},
		getNext: (msg) => (msg.text === dict.update ? DICTIONARY.QUOTES : 'START'),
	},
};

function wrapTradeText(markPrice, trade) {
	let text = '\n'
	text += [trade.type, ' | '].join('');
	if (trade.isWin) {
		text += '⬆️';
	} else if (trade.isLoss) {
		text += '🔻';
	}
	const diff = diffInPercents(trade.markPrice, markPrice) * trade.shoulder;
	if (diff) {
		text += toFixed(diff) + '%';
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
