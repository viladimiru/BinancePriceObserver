import { type Request } from 'express';
import { getChatPairPrices } from '../models/pair';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function getChatPairPricesController(
	request: Request,
	response: ResponseWithError<Awaited<ReturnType<typeof getChatPairPrices>>>
): Promise<void> {
	try {
		const result = await getChatPairPrices({
			chatId: Number(request.params.chatId),
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
