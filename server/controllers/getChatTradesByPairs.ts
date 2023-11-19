import { type Request } from 'express';
import { getChatTradesByPairs } from '../models/trade';
import { controllerErrorHandler, type ResponseWithError } from '../models/controller-error-handler';
import { z } from 'zod';

export async function getChatTradesByPairsController(
	request: Request,
	response: ResponseWithError<Awaited<ReturnType<typeof getChatTradesByPairs>>>
): Promise<void> {
	try {
		const result = await getChatTradesByPairs(getValidatedQueryParams(request.query));
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQueryParams(query: unknown): Parameters<typeof getChatTradesByPairs>[0] {
	return z
		.object({
			pairs: z.array(z.string()),
		})
		.parse(query);
}
