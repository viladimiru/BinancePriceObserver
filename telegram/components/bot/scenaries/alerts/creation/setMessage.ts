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
		const symbol = alertCreationStore.get(message.chat.id).symbol;

		alertCreationStore.set(message.chat.id, {
			message: message.text,
		});
		await apiClient.createPair(alertCreationStore.get(message.chat.id));
		await updateStorage();
		Subscription(symbol);
		await Bot.sendMessage(
			message.chat.id,
			dictionary(message.from.language_code).pairSuccessfullyCreated
		);
		alertCreationStore.deleteKey(message.chat.id);
	},
});
