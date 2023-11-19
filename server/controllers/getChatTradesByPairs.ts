import { type Request } from 'express';
import { getChatTradesByPairs } from '../models/trade';
import {
	controllerErrorHandler,
	type ResponseWithError,
} from '../models/controller-error-handler';

export async function getChatTradesByPairsController(
	request: Request,
	response: ResponseWithError<Awaited<ReturnType<typeof getChatTradesByPairs>>>
): Promise<void> {
	try {
		// TODO: validate
		// @ts-expect-error parse query
		const result = await getChatTradesByPairs({ pairs: request.query.pairs });
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
