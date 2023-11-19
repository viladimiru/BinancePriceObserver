import { z } from 'zod';
import { Bot, type BotMessage } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { Subscription, updateStorage } from '../../../../subscription';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertCreationStore } from '../store';

export const setAlertMessageView = createView({
	id: 'SET_MESSAGE',
	text: (message: BotMessage) => dictionary(message.from.language_code).messageTemplate,
	keyboard: (message: BotMessage) =>
		keyboardWrapper(
			[
				dictionary(message.from.language_code).messageTemplates.map((item) => ({
					text: item,
				})),
			],
			{
				language_code: message.from.language_code,
			}
		),
	onAnswer: async (message: BotMessage) => {
		alertCreationStore.set(message.chat.id, {
			message: message.text,
		});

		const store = getValidatedStore(alertCreationStore.get(message.chat.id));
		await apiClient.createPair(store);
		await updateStorage();
		Subscription(store.symbol);
		await Bot.sendMessage(
			message.chat.id,
			dictionary(message.from.language_code).pairSuccessfullyCreated
		);
		alertCreationStore.deleteKey(message.chat.id);
	},
});

function getValidatedStore(store: unknown): Parameters<typeof apiClient.createPair>[0] {
	return z
		.object({
			symbol: z.string(),
			type: z.string(),
			chatId: z.coerce.number(),
			message: z.string(),
			price: z.coerce.number(),
		})
		.parse(store);
}
