import { type Request, type Response } from 'express';
import { getSession } from '../models/session';
import { type SessionEntity } from '../../shared/models/orm/entities/session';

export async function getSessionController(
	request: Request,
	response: Response<SessionEntity | { error: unknown }>
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
