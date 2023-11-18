import { Bot, type BotMessage } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { Subscription, updateStorage } from '../../../../subscription';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertCreationStore } from '../store';

export const chooseTradeTypeView = createView({
	id: 'CHOOSE_TRADE_TYPE',
	text: (message: BotMessage) =>
		dictionary(message.from.language_code).sendMessageWhen,
	expects: (message: BotMessage) => [
		dictionary(message.from.language_code).above,
		dictionary(message.from.language_code).below,
		dictionary(message.from.language_code).spiking,
	],
	keyboard: (message: BotMessage) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).above,
					},
					{
						text: dictionary(message.from.language_code).below,
					},
				],
				[
					{
						text: dictionary(message.from.language_code).spiking,
					},
				],
			],
			{
				language_code: message.from.language_code,
			}
		),
	onAnswer: async (message) => {
		const type = {
			[dictionary(message.from.language_code).above]: 'ABOVE',
			[dictionary(message.from.language_code).below]: 'BELOW',
			[dictionary(message.from.language_code).spiking]: 'SPIKE',
		}[message.text];
		alertCreationStore.set(message.chat.id, {
			type
		})
		if (message.text === dictionary(message.from.language_code).spiking) {
			await apiClient.createPair(alertCreationStore.get(message.chat.id));
			await updateStorage();
			Subscription(alertCreationStore.get(message.chat.id).symbol);
			await Bot.sendMessage(
				message.chat.id,
				dictionary(message.from.language_code).pairSuccessfullyCreated
			);
			alertCreationStore.deleteKey(message.chat.id);
		}
	},
});
