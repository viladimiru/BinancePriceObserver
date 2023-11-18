import { keyboardWrapper } from '../../utils/keyboard.js';
import { dictionary } from '../../dictionary/index.js';
import { apiClient } from '../../api/index.js';
import { Bot, type BotMessage } from '../index';

export const DICTIONARY = {
	FEEDBACK_MSG: 'FEEDBACK_MSG',
	FEEDBACK_FINISH: 'FEEDBACK_FINISH',
};

export default {
	[DICTIONARY.FEEDBACK_MSG]: {
		id: DICTIONARY.FEEDBACK_MSG,
		text: (message: BotMessage) =>
			dictionary(message.from.language_code).feedback,
		keyboard: (message: BotMessage) =>
			keyboardWrapper([], {
				language_code: message.from.language_code,
			}),
		onAnswer: async (message: BotMessage) => {
			await apiClient.sendFeedback({ msg: JSON.stringify(message) });
			await Bot.sendMessage(
				message.chat.id,
				dictionary(message.from.language_code).thanksForFeedback
			);
		},
	},
};
