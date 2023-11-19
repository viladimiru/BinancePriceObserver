import { type ReplyMarkupReturnType, keyboardWrapper } from '../../utils/keyboard.js';
import Feedback, { DICTIONARY as FB_DICT } from './feedback.js';
import AlertSteps, { ALERT_DICT } from './alerts/index.js';
import TradeSteps, { TRADE_DICT } from './trades/index.js';
import Quotes, { DICTIONARY as QUOTE_DICT } from './quotes.js';
import { dictionary } from '../../dictionary/index.js';
import { type BotMessage } from '../index.js';
import { type Message } from 'node-telegram-bot-api';

export interface Scenary {
	id: string;
	text: (message: BotMessage) => string;
	expects: (message: BotMessage) => string[];
	validate?: (message: BotMessage) => Promise<boolean> | boolean;
	getNext: (message: BotMessage) => string;
	getPrev?: (message: BotMessage) => string;
	keyboard: (message: BotMessage) => Promise<ReplyMarkupReturnType> | ReplyMarkupReturnType;
	errorText?: (message: BotMessage) => string;
	cbOnSend?: (message: BotMessage | Message) => void;
	onAnswer?: (message: BotMessage) => Promise<void> | void;
}

export type ScenariesMap = Record<string, Scenary>;

const START: Scenary = {
	id: 'START',
	text: (message: BotMessage) => dictionary(message.from.language_code).selectDesiredFunction,
	expects: (message: BotMessage) => [
		dictionary(message.from.language_code).alerts,
		dictionary(message.from.language_code).trades,
		dictionary(message.from.language_code).quotes,
		dictionary(message.from.language_code).leaveFeedback,
	],
	getNext: (message: BotMessage) => {
		if (message.text === dictionary(message.from.language_code).alerts) {
			return ALERT_DICT.default.CHOOSE_PAIR_FUNC;
		}
		if (message.text === dictionary(message.from.language_code).leaveFeedback) {
			return FB_DICT.FEEDBACK_MSG;
		}
		if (message.text === dictionary(message.from.language_code).trades) {
			return TRADE_DICT.default.CHOOSE_TRADE_FUNC;
		}
		if (message.text === dictionary(message.from.language_code).quotes) {
			return QUOTE_DICT.QUOTES;
		}
		return START.id;
	},
	keyboard: (message: BotMessage) =>
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
};

const Scenaries: ScenariesMap = {
	START,
	...AlertSteps,
	...Feedback,
	...TradeSteps,
	...Quotes,
};

export default Scenaries;
