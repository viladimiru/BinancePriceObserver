import { dictionary } from '../../dictionary';
import { keyboardWrapper } from '../../utils/keyboard';
import { createView } from '../scenary';

export const startView = createView({
	id: 'START',
	text: (message) => dictionary(message.from.language_code).selectDesiredFunction,
	expects: (message) => [
		dictionary(message.from.language_code).alerts,
		dictionary(message.from.language_code).trades,
		dictionary(message.from.language_code).quotes,
		dictionary(message.from.language_code).leaveFeedback,
	],
	keyboard: (message) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).alerts,
					},
					{
						text: dictionary(message.from.language_code).trades,
					},
				],
				[
					{
						text: dictionary(message.from.language_code).quotes,
					},
					{
						text: dictionary(message.from.language_code).leaveFeedback,
					},
				],
			],
			{
				language_code: message.from.language_code,
			},
			true
		),
});
