import { type Request, type Response } from 'express';
import { updateSession } from '../models/session';

export async function updateSessionController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await updateSession(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
