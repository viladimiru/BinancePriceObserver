import { keyboardWrapper } from '../utils/keyboard.js';
import dict from '../dict/lang/index.js';
import feedbackApi from '../api/feedbackApi.js';
import { get, BOT_MESSANGER } from '../storage/index.js';

export const DICTIONARY = {
	FEEDBACK_MSG: 'FEEDBACK_MSG',
	FEEDBACK_FINISH: 'FEEDBACK_FINISH',
};

export default {
	[DICTIONARY.FEEDBACK_MSG]: {
		id: DICTIONARY.FEEDBACK_MSG,
		text: dict.feedback,
		keyboard: keyboardWrapper(),
		onAnswer: async (msg) => {
			await feedbackApi.addFeedback(msg);
			await get(BOT_MESSANGER)(msg.chat.id, dict.thanksForFeedback);
		},
	},
};
