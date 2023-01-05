import { keyboardWrapper } from '../../utils/keyboard.js';
import dict from '../../dict/lang/index.js';
import DICT from './dict.js'
import tradeCreation from './tradeCreation.js'
import tradeRemoval from './tradeRemoval.js'

export const TRADE_DICT = DICT

export default {
	[DICT.default.CHOOSE_TRADE_FUNC]: {
		id: DICT.default.CHOOSE_TRADE_FUNC,
		text: dict.whatDoYouWant,
		keyboard: keyboardWrapper([
      [
        {
          text: dict.addTrade,
        },
        {
          text: dict.removeTrade
        }
      ]
    ]),
    expects: [dict.addTrade, dict.removeTrade],
		errorText: dict.pairNotExists,
		getNext: (msg) => {
      if (msg.text === dict.addTrade) return DICT.creation.SYMBOL
      if (msg.text === dict.removeTrade) return DICT.removal.TRADE_LIST
    },
	},
  ...tradeCreation,
  ...tradeRemoval
};
