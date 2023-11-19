import { type Request } from 'express';
import { createUser } from '../models/user';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function createUserController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await createUser(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
