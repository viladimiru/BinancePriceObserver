import { keyboardWrapper } from '../../utils/keyboard.js';
import STEP_DICT from './dict.js';
import pairCreation from './pairCreation.js';
import pairRemoval from './pairRemoval.js';
import { dictionary } from '../../dict/index.js';

export const ALERT_DICT = STEP_DICT;

export default {
	[STEP_DICT.default.CHOOSE_PAIR_FUNC]: {
		id: STEP_DICT.default.CHOOSE_PAIR_FUNC,
		text: (msg) => dictionary(msg.from.language_code).whatDoYouWant,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).addObserver,
						},
						{
							text: dictionary(msg.from.language_code).removeObserver,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		expects: (msg) => [
			dictionary(msg.from.language_code).addObserver,
			dictionary(msg.from.language_code).removeObserver,
		],
		errorText: (msg) => dictionary(msg.from.language_code).pairNotExists,
		getNext: (msg) => {
			if (msg.text === dictionary(msg.from.language_code).addObserver)
				return ALERT_DICT.creation.ADD_OBSERVER;
			if (msg.text === dictionary(msg.from.language_code).removeObserver)
				return ALERT_DICT.removal.PAIRS_LIST;
		},
	},
	...pairCreation,
	...pairRemoval,
};
