import { type Request } from 'express';
import { isPriceExist } from '../models/price';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';
import { z } from 'zod';

export async function isPriceExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		const result = await isPriceExist(getValidatedQuery(request.query));
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQuery(query: unknown): Parameters<typeof isPriceExist>[0] {
	return z
		.object({
			symbol: z.string(),
			chatId: z.number(),
			type: z.string(),
			price: z.number(),
		})
		.parse(query);
}
