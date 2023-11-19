import { type Request } from 'express';
import { removePrice } from '../models/price';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function removePriceController(
	request: Request,
	response: ResponseWithError<Awaited<ReturnType<typeof removePrice>>>
): Promise<void> {
	try {
		const result = await removePrice(request.body);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
