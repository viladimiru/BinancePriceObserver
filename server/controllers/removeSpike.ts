import { type Request } from 'express';
import { removeSpike } from '../models/spike';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function removeSpikeController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await removeSpike(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
