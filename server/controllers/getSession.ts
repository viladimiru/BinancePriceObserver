import { type Request } from 'express';
import { getSession } from '../models/session';
import { type SessionEntity } from '../../shared/models/orm/entities/session';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';
import { z } from 'zod';

export async function getSessionController(
	request: Request,
	response: ResponseWithError<SessionEntity>
): Promise<void> {
	try {
		const result = await getSession(getValidatedQuery(request.query));
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQuery(query: unknown): Parameters<typeof getSession>[0] {
	return z
		.object({
			userId: z.number(),
		})
		.parse(query);
}
