import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

export const setShoulderView = createView({
	id: 'SET_SHOULDER',
	text: (message) => dictionary(message.from.language_code).shoulder,
	errorText: (message) =>
		dictionary(message.from.language_code).enterOnlyNumbers,
	keyboard: (message) =>
		keyboardWrapper([], {
			language_code: message.from.language_code,
		}),
	validate: ({ text }) => {
		return !isNaN(Number(text));
	},
	onAnswer: async (message) => {
		alertTradeStore.set(message.chat.id, {
			shoulder: Number(message.text),
		});
	},
});
