import { type Request } from 'express';
import { getChatPairs } from '../models/pair';
import { type PairWithEntities } from '../../shared/models/pair';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';
import { z } from 'zod';

export async function getChatPairsController(
	request: Request,
	response: ResponseWithError<PairWithEntities[]>
): Promise<void> {
	try {
		const result = await getChatPairs(getValidatedQuery(request.query));
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}

function getValidatedQuery(query: unknown): Parameters<typeof getChatPairs>[0] {
	return z
		.object({
			chatId: z.number(),
			symbol: z.string(),
		})
		.parse(query);
}
