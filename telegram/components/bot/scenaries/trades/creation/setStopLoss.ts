import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

export const setStopLossView = createView({
	id: 'SET_STOP_LOSS',
	text: (message) => dictionary(message.from.language_code).stopLossIfExist,
	errorText: (message) =>
		dictionary(message.from.language_code).alertPriceError,
	keyboard: (message) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).miss,
					},
				],
			],
			{
				language_code: message.from.language_code,
			}
		),
	validate: ({ text, from: { language_code } }) => {
		return text === dictionary(language_code).miss || !isNaN(Number(text));
	},
	onAnswer: async (message) => {
		if (message.text !== dictionary(message.from.language_code).miss) {
			alertTradeStore.set(message.chat.id, {
				stopLoss: Number(message.text)
			});
		}
	},
});
