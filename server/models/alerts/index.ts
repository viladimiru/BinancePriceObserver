import { type DeleteAlerts } from '../../../shared/models/alerts';
import { PAIR, PRICE, SPIKE } from '../orm';

export const deleteAlerts: DeleteAlerts = async (params) => {
	// TODO: This functional delete all client alerts
	const promises = [
		PRICE.destroy({
			where: {
				chatId: params.chatId,
			},
			// TODO: FIX TS ISSUE
			// @ts-expect-error invalid include
			include: {
				model: PAIR,
				where: {
					symbol: params.symbol,
				},
			},
		}),
		SPIKE.destroy({
			where: {
				chatId: params.chatId,
			},
			// TODO: FIX TS ISSUE
			// @ts-expect-error invalid include
			include: {
				model: PAIR,
				where: {
					symbol: params.symbol,
				},
			},
		}),
	];
	await Promise.all(promises);
};
