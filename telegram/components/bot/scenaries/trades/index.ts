import { keyboardWrapper } from '../../../utils/keyboard.js';
import DICT from './dict.js';
import tradeCreation from './tradeCreation.js';
import tradeRemoval from './tradeRemoval.js';
import { dictionary } from '../../../dictionary/index.js';
import { type BotMessage } from '../../index.js';

export const TRADE_DICT = DICT;

export default {
	[DICT.default.CHOOSE_TRADE_FUNC]: {
		id: DICT.default.CHOOSE_TRADE_FUNC,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).whatDoYouWant,
		keyboard: (message: BotMessage) =>
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
		expects: (message: BotMessage) => [
			dictionary(message.from.language_code).addTrade,
			dictionary(message.from.language_code).removeTrade,
		],
		errorText: (message: BotMessage) =>
			dictionary(message.from.language_code).pairNotExists,
		getNext: (message: BotMessage) => {
			if (message.text === dictionary(message.from.language_code).addTrade) {
				return DICT.creation.SYMBOL;
			}
			if (message.text === dictionary(message.from.language_code).removeTrade) {
				return DICT.removal.TRADE_LIST;
			}
			return 'START';
		},
	},
	...tradeCreation,
	...tradeRemoval,
};
