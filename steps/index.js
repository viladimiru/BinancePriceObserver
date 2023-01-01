import PairCreation, {DICTIONARY as PC_DICT} from './pairCreation.js';
import PairRemoval, {DICTIONARY as PR_DICT} from './pairRemoval.js'
import Quotes, {DICTIONARY as Q_DICT} from './quotes.js';
import TradeCreation, {DICTIONARY as T_DICT} from './tradeCreation.js';
import TradeRemoval, {DICTIONARY as TR_DICT} from './tradeRemoval.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/index.js';
import Feedback, {DICTIONARY as FB_DICT} from './feedback.js';

const START = {
	id: 'START',
	text: ['<b>Добро пожаловать</b>', 'Выберите нужную функцию'].join('\n\n'),
	expects: [dict.addObserver, dict.removeObserver, dict.quotes, dict.addTrade, dict.removeTrade, dict.leaveFeedback],
	getNext: (msg) => {
		if (msg.text === dict.addObserver) {
			return PC_DICT.ADD_OBSERVER;
		}
		if (msg.text === dict.removeObserver) {
			return PR_DICT.PAIRS_LIST;
		}
		if (msg.text === dict.quotes) {
			return Q_DICT.QUOTES
		}
		if (msg.text === dict.addTrade) {
			return T_DICT.SYMBOL
		}
		if (msg.text === dict.removeTrade) {
			return TR_DICT.TRADE_LIST
		}
		if (msg.text === dict.leaveFeedback) {
			return FB_DICT.FEEDBACK_MSG
		}
	},
	keyboard: keyboardWrapper(
		[
			[
				{
					text: dict.addObserver,
				},
				{
					text: dict.removeObserver,
				},
			],
			[
				{
					text: dict.addTrade
				},
				{
					text: dict.removeTrade
				}
			],
			[
				{
					text: dict.quotes
				},
				{
					text: dict.leaveFeedback
				}
			]
		],
		null,
		true
	),
};

PairCreation.ADD_OBSERVER.getPrev = () => START.id;

export default {
	START,
	...PairCreation,
	...PairRemoval,
	...Quotes,
	...TradeCreation,
	...TradeRemoval,
	...Feedback
};
