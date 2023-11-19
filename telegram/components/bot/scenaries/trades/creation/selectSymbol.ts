import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

export const selectSymbolView = createView({
	id: 'SELECT_SYMBOL',
	text: (message) => dictionary(message.from.language_code).symbol,
	keyboard: (message) =>
		keyboardWrapper([], {
			language_code: message.from.language_code,
		}),
	validate: async ({ text }) => {
		try {
			return await apiClient.isFutureExist({
				symbol: text.toUpperCase(),
			});
		} catch {
			return false;
		}
	},
	onAnswer: async (message) => {
		alertTradeStore.set(message.chat.id, {
			chatId: message.chat.id,
			symbol: message.text.toUpperCase(),
		});
	},
	errorText: (message) => dictionary(message.from.language_code).pairNotExists,
});
