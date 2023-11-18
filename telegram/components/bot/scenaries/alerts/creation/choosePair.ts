import { type BotMessage } from '../../..';
import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';

export const choosePairView = createView({
	id: 'CHOOSE_PAIR',
	text: (message: BotMessage) =>
		dictionary(message.from.language_code).whatDoYouWant,
	keyboard: (message: BotMessage) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).addObserver,
					},
					{
						text: dictionary(message.from.language_code).removeObserver,
					},
				],
			],
			{
				language_code: message.from.language_code,
			}
		),
	expects: (message: BotMessage) => [
		dictionary(message.from.language_code).addObserver,
		dictionary(message.from.language_code).removeObserver,
	],
	errorText: (message: BotMessage) =>
		dictionary(message.from.language_code).pairNotExists,
});
