import { type Request, type Response } from 'express';
import { getSession } from '../models/session';

export async function getSessionController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		// TODO: validate
		// @ts-expect-error parse query
		const result = await getSession(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
