import { keyboardWrapper } from '../../utils/keyboard.js';
import dict from '../../dict/lang/index.js';
import STEP_DICT from './dict.js'
import pairCreation from './pairCreation.js';
import pairRemoval from './pairRemoval.js'

export const ALERT_DICT = STEP_DICT

export default {
	[STEP_DICT.default.CHOOSE_PAIR_FUNC]: {
		id: STEP_DICT.default.CHOOSE_PAIR_FUNC,
		text: dict.whatDoYouWant,
		keyboard: keyboardWrapper([
      [
        {
          text: dict.addObserver,
        },
        {
          text: dict.removeObserver
        }
      ]
    ]),
    expects: [dict.addObserver, dict.removeObserver],
		errorText: dict.pairNotExists,
		getNext: (msg) => {
      if (msg.text === dict.addObserver) return ALERT_DICT.creation.ADD_OBSERVER
      if (msg.text === dict.removeObserver) return ALERT_DICT.removal.PAIRS_LIST
    },
	},
  ...pairCreation,
  ...pairRemoval
};
