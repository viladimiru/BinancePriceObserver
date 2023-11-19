import { Bot } from '../../..';
import { apiClient } from '../../../../api';
import { dictionary } from '../../../../dictionary';
import { Subscription, updateStorage } from '../../../../subscription';
import { keyboardWrapper } from '../../../../utils/keyboard';
import { createView } from '../../../scenary';
import { alertTradeStore } from '../store';

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
		// todo: controller POST createTrade
		if (message.text !== dictionary(message.from.language_code).miss) {
			alertTradeStore.set(message.chat.id, {
				spiking: true,
			});
		}
		const payload = alertTradeStore.get(message.chat.id);
		await apiClient.createTrade(payload);

		if (payload.stopLoss) {
			await apiClient.createPriceWithSymbol({
				chatId: message.chat.id,
				message: dictionary(message.from.language_code).messageTemplates[0],
				type:
					payload.type === dictionary(message.from.language_code).long.toUpperCase()
						? 'BELOW'
						: 'ABOVE',
				price: payload.stopLoss,
				symbol: payload.symbol,
			});
		}

		if (payload.takeProfit) {
			await apiClient.createPriceWithSymbol({
				chatId: message.chat.id,
				message: dictionary(message.from.language_code).messageTemplates[1],
				type:
					payload.type === dictionary(message.from.language_code).short.toUpperCase()
						? 'BELOW'
						: 'ABOVE',
				price: payload.takeProfit,
				symbol: payload.symbol,
			});
		}

		if (payload.spiking) {
			await apiClient.createSpikeWithSymbol({
				chatId: message.chat.id,
				symbol: payload.symbol,
			});
		}

		if (payload.stopLoss || payload.takeProfit || payload.spiking) {
			await updateStorage();
			Subscription(payload.symbol);
		}

		await Bot.sendMessage(message.chat.id, dictionary(message.from.language_code).tradeCreated, {
			parse_mode: 'HTML',
		});

		alertTradeStore.deleteKey(message.chat.id);
	},
});
