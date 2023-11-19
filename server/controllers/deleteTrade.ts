import { type Request } from 'express';
import { removeTrade } from '../models/trade';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function deleteTradeController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await removeTrade(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
