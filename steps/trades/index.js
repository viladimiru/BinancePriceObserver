import { keyboardWrapper } from '../../utils/keyboard.js';
import DICT from './dict.js';
import tradeCreation from './tradeCreation.js';
import tradeRemoval from './tradeRemoval.js';
import { dictionary } from '../../dict/index.js';

export const TRADE_DICT = DICT;

export default {
	[DICT.default.CHOOSE_TRADE_FUNC]: {
		id: DICT.default.CHOOSE_TRADE_FUNC,
		text: (msg) => dictionary(msg.from.language_code).whatDoYouWant,
		keyboard: (msg) =>
			keyboardWrapper(
				[
					[
						{
							text: dictionary(msg.from.language_code).addTrade,
						},
						{
							text: dictionary(msg.from.language_code).removeTrade,
						},
					],
				],
				{
					language_code: msg.from.language_code,
				}
			),
		expects: (msg) => [
			dictionary(msg.from.language_code).addTrade,
			dictionary(msg.from.language_code).removeTrade,
		],
		errorText: (msg) => dictionary(msg.from.language_code).pairNotExists,
		getNext: (msg) => {
			if (msg.text === dictionary(msg.from.language_code).addTrade)
				return DICT.creation.SYMBOL;
			if (msg.text === dictionary(msg.from.language_code).removeTrade)
				return DICT.removal.TRADE_LIST;
		},
	},
	...tradeCreation,
	...tradeRemoval,
};
