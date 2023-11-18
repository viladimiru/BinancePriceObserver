import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

export const selectTypeView = createView({
	id: 'SELECT_TYPE',
	text: (message) => dictionary(message.from.language_code).tradeType,
	keyboard: (message) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).long,
					},
					{
						text: dictionary(message.from.language_code).short,
					},
				],
			],
			{
				language_code: message.from.language_code,
			}
		),
	expects: (message) => [
		dictionary(message.from.language_code).long,
		dictionary(message.from.language_code).short,
	],
	onAnswer: async (message) => {
		alertTradeStore.set(message.chat.id, {
			type: message.text.toUpperCase(),
		});
	},
});
