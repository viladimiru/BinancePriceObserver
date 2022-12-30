import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/index.js';
import eventBus from '../utils/eventBus.js';
import pairApi from '../api/pairApi.js';

export const DICTIONARY = {
	QUOTES: 'QUOTES',
};

export default {
	[DICTIONARY.QUOTES]: {
		id: 'QUOTES',
		text: dict.loadingQuotes,
		keyboard: keyboardWrapper(),
		cbOnSend: async (msg) => {
			const result = await pairApi.getChatPairPrices(msg.chat.id);
			if (result) {
				let text = '';
				result.forEach((item) => {
					text += [`<b>${item.symbol}</b>`, item.markPrice].join(': ');
					text += '\n';
				});
				eventBus.emit('sendMessage', null, msg.chat.id, text, {
					parse_mode: 'html',
				});
			} else {
				eventBus.emit('sendMessage', null, msg.chat.id, dict.listIsEmpty);
			}
		},
		getNext: () => 'START',
		getPrev: () => 'START',
	},
};
