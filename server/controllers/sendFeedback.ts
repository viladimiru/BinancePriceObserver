import { type Request } from 'express';
import { addFeedback } from '../models/feedback/index.js';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler/index.js';

export async function sendFeedbackController(
	request: Request,
	response: ResponseWithError
): Promise<void> {
	try {
		await addFeedback(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
