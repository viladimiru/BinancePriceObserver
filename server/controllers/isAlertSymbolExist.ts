import { type Request } from 'express';
import { isAlertSymbolExist } from '../models/pair';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';
import { z } from 'zod';

export async function isAlertSymbolExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		const result = await isAlertSymbolExist(getValidatedQuery(request.query));
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQuery(
	query: unknown
): Parameters<typeof isAlertSymbolExist>[0] {
	return z
		.object({
			chatId: z.number(),
			symbol: z.string(),
		})
		.parse(query);
}
