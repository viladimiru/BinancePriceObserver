import { type Request } from 'express';
import { isSpikeExist } from '../models/spike';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';
import { z } from 'zod';

export async function isSpikeExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		const result = await isSpikeExist(getValidatedQuery(request.query));
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQuery(query: unknown): Parameters<typeof isSpikeExist>[0] {
	return z
		.object({
			chatId: z.number(),
			symbol: z.string(),
		})
		.parse(query);
}
