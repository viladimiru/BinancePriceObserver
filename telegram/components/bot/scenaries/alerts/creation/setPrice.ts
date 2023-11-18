import { type BotMessage } from '../../..';
import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertCreationStore } from '../store';

export const setAlertPriceView = createView({
	id: 'SET_ALERT_PRICE',
	text: (message: BotMessage) =>
		dictionary(message.from.language_code).enterAlertPrice,
	validate: ({ text }: BotMessage) => {
		return !isNaN(Number(text));
	},
	errorText: (message: BotMessage) =>
		dictionary(message.from.language_code).alertPriceError,
	keyboard: (message: BotMessage) =>
		keyboardWrapper([], {
			language_code: message.from.language_code,
		}),
	onAnswer: async (message: BotMessage) => {
		alertCreationStore.set(message.chat.id, {
			price: Number(message.text),
		});
	},
});
