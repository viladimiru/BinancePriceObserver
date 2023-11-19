import { type Request } from 'express';
import { createTrade } from '../models/trade';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function createTradeController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await createTrade(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
