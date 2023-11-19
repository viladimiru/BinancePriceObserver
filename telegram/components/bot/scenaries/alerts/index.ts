import { keyboardWrapper } from '../../../utils/keyboard.js';
import STEP_DICT from './dict.js';
import pairCreation from './pairCreation.js';
import pairRemoval from './pairRemoval.js';
import { dictionary } from '../../../dictionary/index.js';
import { type BotMessage } from '../../index.js';
import { type ScenariesMap } from '../index.js';

export const ALERT_DICT = STEP_DICT;

// TODO: fix
// @ts-expect-error need to fix keyof
const scenary: ScenariesMap = {
	[STEP_DICT.default.CHOOSE_PAIR_FUNC]: {
		id: STEP_DICT.default.CHOOSE_PAIR_FUNC,
		text: (message: BotMessage) => dictionary(message.from.language_code).whatDoYouWant,
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
		errorText: (message: BotMessage) => dictionary(message.from.language_code).pairNotExists,
		getNext: (message: BotMessage) => {
			if (message.text === dictionary(message.from.language_code).addObserver) {
				return ALERT_DICT.creation.ADD_OBSERVER;
			}
			if (message.text === dictionary(message.from.language_code).removeObserver) {
				return ALERT_DICT.removal.PAIRS_LIST;
			}
			return 'START';
		},
	},
	...pairCreation,
	...pairRemoval,
};

export default scenary;
