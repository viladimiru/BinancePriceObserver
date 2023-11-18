import { dictionary } from '../../../dictionary';
import { keyboardWrapper } from '../../../utils/keyboard';
import { createView } from '../../scenary';

export const chooseAlertActionView = createView({
	id: 'CHOOSE_ALERT_ACTION',
	text: (message) => dictionary(message.from.language_code).whatDoYouWant,
	keyboard: (message) =>
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
	expects: (message) => [
		dictionary(message.from.language_code).addObserver,
		dictionary(message.from.language_code).removeObserver,
	],
	errorText: (message) => dictionary(message.from.language_code).pairNotExists,
});
