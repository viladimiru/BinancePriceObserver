import PairCreation, {DICTIONARY as PC_DICT} from './pairCreation.js';
import PairRemoval, {DICTIONARY as PR_DICT} from './pairRemoval.js'
import Quotes, {DICTIONARY as Q_DICT} from './quotes.js';
import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/index.js';

const START = {
	id: 'START',
	text: ['<b>Добро пожаловать</b>', 'Выберите нужную функцию'].join('\n\n'),
	expects: [dict.addObserver, dict.removeObserver, dict.quotes],
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
					text: dict.quotes
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
	...Quotes
};
