import { type Request } from 'express';
import { createPair } from '../models/pair';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function createPairController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await createPair(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
