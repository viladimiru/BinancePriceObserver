import { type Request, type Response } from 'express';
import { addFeedback } from '../models/feedback/index.js';

export async function sendFeedbackController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await addFeedback(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
