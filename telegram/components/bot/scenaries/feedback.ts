import { Bot, type BotMessage } from '..';
import { apiClient } from '../../api';
import { dictionary } from '../../dictionary';
import { keyboardWrapper } from '../../utils/keyboard';
import { createView } from '../scenary';

export const feedbackView = createView({
	id: 'FEEDBACK',
	text: (message: BotMessage) => dictionary(message.from.language_code).feedback,
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
});
