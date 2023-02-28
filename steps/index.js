import { keyboardWrapper } from '../utils/keyboard.js';
import Feedback, { DICTIONARY as FB_DICT } from './feedback.js';
import AlertSteps, { ALERT_DICT } from './alerts/index.js';
import TradeSteps, { TRADE_DICT } from './trades/index.js';
import Quotes, { DICTIONARY as QUOTE_DICT } from './quotes.js';
import { dictionary } from '../dict/index.js';

const START = {
	id: 'START',
	text: (msg) => dictionary(msg.from.language_code).selectDesiredFunction,
	expects: (msg) => [
		dictionary(msg.from.language_code).alerts,
		dictionary(msg.from.language_code).trades,
		dictionary(msg.from.language_code).quotes,
		dictionary(msg.from.language_code).leaveFeedback,
	],
	getNext: (msg) => {
		if (msg.text === dictionary(msg.from.language_code).alerts) {
			return ALERT_DICT.default.CHOOSE_PAIR_FUNC;
		}
		if (msg.text === dictionary(msg.from.language_code).leaveFeedback) {
			return FB_DICT.FEEDBACK_MSG;
		}
		if (msg.text === dictionary(msg.from.language_code).trades) {
			return TRADE_DICT.default.CHOOSE_TRADE_FUNC;
		}
		if (msg.text === dictionary(msg.from.language_code).quotes) {
			return QUOTE_DICT.QUOTES;
		}
	},
	keyboard: (msg) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(msg.from.language_code).alerts,
					},
					{
						text: dictionary(msg.from.language_code).trades,
					},
				],
				[
					{
						text: dictionary(msg.from.language_code).quotes,
					},
					{
						text: dictionary(msg.from.language_code).leaveFeedback,
					},
				],
			],
			{
				language_code: msg.from.language_code,
			},
			true
		),
};

export default {
	START,
	...AlertSteps,
	...Feedback,
	...TradeSteps,
	...Quotes,
};
