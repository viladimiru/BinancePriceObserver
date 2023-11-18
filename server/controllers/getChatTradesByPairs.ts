import { type Request, type Response } from 'express';
import { getChatTradesByPairs } from '../models/trade';

export async function getChatTradesByPairsController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		// TODO: validate
		// @ts-expect-error parse query
		const result = await getChatTradesByPairs({ pairs: request.query.pairs });
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
