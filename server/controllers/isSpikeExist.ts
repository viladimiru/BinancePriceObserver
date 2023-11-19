import { type Request } from 'express';
import { isSpikeExist } from '../models/spike';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function isSpikeExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await isSpikeExist(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
