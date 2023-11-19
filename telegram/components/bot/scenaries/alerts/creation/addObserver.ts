import { type BotMessage } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertCreationStore } from '../store';

export const addObserverView = createView({
	id: 'ADD_OBSERVER',
	text: (message: BotMessage) => dictionary(message.from.language_code).symbol,
	keyboard: (message: BotMessage) =>
		keyboardWrapper([], {
			language_code: message.from.language_code,
		}),
	validate: async ({ text }: BotMessage) => {
		try {
			return await apiClient.isFutureExist({
				symbol: text.toUpperCase(),
			});
		} catch (error) {
			return false;
		}
	},
	onAnswer: async (message) => {
		alertCreationStore.set(message.chat.id, {
			chatId: message.chat.id,
			symbol: message.text.toUpperCase(),
		});
	},
	errorText: (message: BotMessage) => dictionary(message.from.language_code).pairNotExists,
});
