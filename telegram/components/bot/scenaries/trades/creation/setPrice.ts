import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

export const setPriceView = createView({
	id: 'SET_PRICE',
	text: (message) => dictionary(message.from.language_code).tradePrice,
	keyboard: (message) =>
		keyboardWrapper([], {
			language_code: message.from.language_code,
		}),
	errorText: (message) => dictionary(message.from.language_code).alertPriceError,
	validate: ({ text }) => {
		return !isNaN(Number(text));
	},
	onAnswer: async (message) => {
		alertTradeStore.set(message.chat.id, {
			markPrice: Number(message.text),
		});
	},
});
