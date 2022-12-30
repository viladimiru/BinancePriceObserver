import PairCreation, {DICTIONARY as PC_DICT} from './pairCreation.js';
import PairRemoval, {DICTIONARY as PR_DICT} from './pairRemoval.js'
import { ADD_OBSERVER, REMOVE_OBSERVER } from '../textDictionary.js';
import { keyboardWrapper } from '../utils/keyboard.js';
const START = {
	id: 'START',
	text: ['<b>Добро пожаловать</b>', 'Выберите нужную функцию'].join('\n\n'),
	expects: [ADD_OBSERVER, REMOVE_OBSERVER],
	getNext: (msg) => {
		if (msg.text === ADD_OBSERVER) {
			return PC_DICT.ADD_OBSERVER;
		}
		if (msg.text === REMOVE_OBSERVER) {
			return PR_DICT.PAIRS_LIST;
		}
	},
	keyboard: keyboardWrapper(
		[
			[
				{
					text: ADD_OBSERVER,
				},
				{
					text: REMOVE_OBSERVER,
				},
			],
		],
		null,
		true
	),
};

PairCreation.ADD_OBSERVER.getPrev = () => START.id;

export default {
	START,
	...PairCreation,
	...PairRemoval
};
