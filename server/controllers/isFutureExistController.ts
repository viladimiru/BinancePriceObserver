import { type Request } from 'express';
import { isFutureExist } from '../models/future';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function isFutureExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		const result = await isFutureExist({
			symbol: request.params.symbol,
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
