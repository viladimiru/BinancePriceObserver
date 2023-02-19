import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js';
import Feedback, { DICTIONARY as FB_DICT } from './feedback.js';
import AlertSteps, { ALERT_DICT } from './alerts/index.js';
import TradeSteps, { TRADE_DICT } from './trades/index.js';
import Quotes, { DICTIONARY as QUOTE_DICT } from './quotes.js';

const START = {
	id: 'START',
	text: dict.selectDesiredFunction,
	expects: [dict.alerts, dict.trades, dict.quotes, dict.leaveFeedback],
	getNext: (msg) => {
		if (msg.text === dict.alerts) {
			return ALERT_DICT.default.CHOOSE_PAIR_FUNC;
		}
		if (msg.text === dict.leaveFeedback) {
			return FB_DICT.FEEDBACK_MSG;
		}
		if (msg.text === dict.trades) {
			return TRADE_DICT.default.CHOOSE_TRADE_FUNC;
		}
		if (msg.text === dict.quotes) {
			return QUOTE_DICT.QUOTES;
		}
	},
	keyboard: keyboardWrapper(
		[
			[
				{
					text: dict.alerts,
				},
				{
					text: dict.trades,
				},
			],
			[
				{
					text: dict.quotes,
				},
				{
					text: dict.leaveFeedback,
				},
			],
		],
		null,
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
