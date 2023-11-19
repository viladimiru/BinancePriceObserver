import { z } from 'zod';
import { Bot } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { Subscription, updateStorage } from '../../../../subscription';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { type AlertTradeEntity, alertTradeStore } from '../store';

export const setSpikingView = createView({
	id: 'SET_SPIKING',
	text: (message) => dictionary(message.from.language_code).spikingIfNeeded,
	keyboard: (message) =>
		keyboardWrapper(
			[
				[
					{
						text: dictionary(message.from.language_code).yes,
					},
					{
						text: dictionary(message.from.language_code).miss,
					},
				],
			],
			{
				language_code: message.from.language_code,
			}
		),
	expects: (message) => [
		dictionary(message.from.language_code).miss,
		dictionary(message.from.language_code).yes,
	],
	onAnswer: async (message) => {
		if (message.text !== dictionary(message.from.language_code).miss) {
			alertTradeStore.set(message.chat.id, {
				spiking: true,
			});
		}
		const store = getValidatedStore(alertTradeStore.get(message.chat.id));
		await apiClient.createTrade(store);

		if (store.stopLoss) {
			await apiClient.createPriceWithSymbol({
				chatId: message.chat.id,
				message: dictionary(message.from.language_code).messageTemplates[0],
				type:
					store.type === dictionary(message.from.language_code).long.toUpperCase()
						? 'BELOW'
						: 'ABOVE',
				price: store.stopLoss,
				symbol: store.symbol,
			});
		}

		if (store.takeProfit) {
			await apiClient.createPriceWithSymbol({
				chatId: message.chat.id,
				message: dictionary(message.from.language_code).messageTemplates[1],
				type:
					store.type === dictionary(message.from.language_code).short.toUpperCase()
						? 'BELOW'
						: 'ABOVE',
				price: store.takeProfit,
				symbol: store.symbol,
			});
		}

		if (store.spiking) {
			await apiClient.createSpikeWithSymbol({
				chatId: message.chat.id,
				symbol: store.symbol,
			});
		}

		if (store.stopLoss || store.takeProfit || store.spiking) {
			await updateStorage();
			Subscription(store.symbol);
		}

		await Bot.sendMessage(message.chat.id, dictionary(message.from.language_code).tradeCreated, {
			parse_mode: 'HTML',
		});

		alertTradeStore.deleteKey(message.chat.id);
	},
});

function getValidatedStore(store: unknown): AlertTradeEntity {
	return z
		.object({
			chatId: z.coerce.number(),
			symbol: z.string(),
			type: z.string(),
			markPrice: z.coerce.number(),
			shoulder: z.coerce.number(),
			spiking: z.coerce.boolean().optional(),
			stopLoss: z.coerce.number().optional(),
			takeProfit: z.coerce.number().optional(),
		})
		.parse(store);
}
