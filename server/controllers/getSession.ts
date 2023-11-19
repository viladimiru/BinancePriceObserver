import { type Request } from 'express';
import { getSession } from '../models/session';
import { type SessionEntity } from '../../shared/models/orm/entities/session';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function getSessionController(
	request: Request,
	response: ResponseWithError<SessionEntity>
): Promise<void> {
	try {
		// TODO: validate
		// @ts-expect-error parse query
		const result = await getSession(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
