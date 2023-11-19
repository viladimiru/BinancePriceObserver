import { type Request } from 'express';
import { updateSession } from '../models/session';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function updateSessionController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await updateSession(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
