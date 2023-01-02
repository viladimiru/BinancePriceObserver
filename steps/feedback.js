import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js'
import feedbackApi from '../api/feedbackApi.js';

export const DICTIONARY = {
	FEEDBACK_MSG: 'FEEDBACK_MSG',
  FEEDBACK_FINISH: 'FEEDBACK_FINISH'
};

export default {
	[DICTIONARY.FEEDBACK_MSG]: {
		id: DICTIONARY.FEEDBACK_MSG,
		text: dict.feedback,
		getNext: () => DICTIONARY.FEEDBACK_FINISH,
		keyboard: keyboardWrapper(),
    onAnswer: async (msg) => {
      await feedbackApi.addFeedback(msg)
    }
	},
	[DICTIONARY.FEEDBACK_FINISH]: {
		id: DICTIONARY.FEEDBACK_FINISH,
		text: dict.thanksForFeedback,
		getNext: () => 'START',
		keyboard: keyboardWrapper(
			[
				[
					{
						text: dict.toTheMain,
					},
				],
			],
			null,
			true
		),
	},
};
