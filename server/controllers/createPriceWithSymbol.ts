import { type Request } from 'express';
import { createPriceWithSymbol } from '../models/price';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function createPriceWithSymbolController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await createPriceWithSymbol(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
