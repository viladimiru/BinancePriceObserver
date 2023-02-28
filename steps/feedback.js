import { keyboardWrapper } from '../utils/keyboard.js';
import feedbackApi from '../api/feedbackApi.js';
import { get, BOT_MESSANGER } from '../storage/index.js';
import { dictionary } from '../dict/index.js';

export const DICTIONARY = {
	FEEDBACK_MSG: 'FEEDBACK_MSG',
	FEEDBACK_FINISH: 'FEEDBACK_FINISH',
};

export default {
	[DICTIONARY.FEEDBACK_MSG]: {
		id: DICTIONARY.FEEDBACK_MSG,
		text: (msg) => dictionary(msg.from.language_code).feedback,
		keyboard: (msg) =>
			keyboardWrapper([], {
				language_code: msg.from.language_code,
			}),
		onAnswer: async (msg) => {
			await feedbackApi.addFeedback(msg);
			await get(BOT_MESSANGER)(
				msg.chat.id,
				dictionary(msg.from.language_code).thanksForFeedback
			);
		},
	},
};
