import { type Request } from 'express';
import { createSpikeWithSymbol } from '../models/spike';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function createSpikeWithSymbolController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await createSpikeWithSymbol(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
