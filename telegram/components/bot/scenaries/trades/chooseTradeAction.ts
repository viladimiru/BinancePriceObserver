import { dictionary } from '../../../dictionary';
import { keyboardWrapper } from '../../../utils/keyboard';
import { createView } from '../../scenary';

export const chooseTradeActionView = createView({
	id: 'CHOOSE_TRADE_ACTION',
	text: (message) => dictionary(message.from.language_code).whatDoYouWant,
	keyboard: (message) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).addTrade,
					},
					{
						text: dictionary(message.from.language_code).removeTrade,
					},
				],
			],
			{
				language_code: message.from.language_code,
			}
		),
	expects: (message) => [
		dictionary(message.from.language_code).addTrade,
		dictionary(message.from.language_code).removeTrade,
	],
	errorText: (message) => dictionary(message.from.language_code).pairNotExists,
});
