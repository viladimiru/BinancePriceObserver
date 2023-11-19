import { type Request } from 'express';
import { getChatTrades } from '../models/trade';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function getChatTradesController(
	request: Request,
	response: ResponseWithError<Awaited<ReturnType<typeof getChatTrades>>>
): Promise<void> {
	try {
		const result = await getChatTrades({
			chatId: Number(request.params.chatId),
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
