import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

export const setTakeProfitView = createView({
	id: 'SET_TAKE_PROFIT',
	text: (message) => dictionary(message.from.language_code).takeProfitIfExist,
	errorText: (message) => dictionary(message.from.language_code).alertPriceError,
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
	validate: (message) => {
		return (
			message.text === dictionary(message.from.language_code).miss || !isNaN(Number(message.text))
		);
	},
	onAnswer: async (message) => {
		if (message.text !== dictionary(message.from.language_code).miss) {
			alertTradeStore.set(message.chat.id, {
				takeProfit: Number(message.text),
			});
		}
	},
});
