import { type Request, type Response } from 'express';
import { isChatTradeExist } from '../models/trade';
import { z } from 'zod';
import { controllerErrorHandler } from '../models/controller-error-handler';

export async function isChatTradeExistController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		const params = getValidatedQuery(request.query);
		const result = await isChatTradeExist(params);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQuery(query: unknown): Parameters<typeof isChatTradeExist>[0] {
	return z
		.object({
			chatId: z.coerce.number(),
			type: z.string(),
			markPrice: z.coerce.number(),
			symbol: z.string(),
		})
		.parse(query);
}
