import { type Request, type Response } from 'express';
import { getChatPairs } from '../models/pair';
import { type PairWithEntities } from '../../shared/models/pair';

export async function getChatPairsController(
	request: Request,
	response: Response<PairWithEntities[] | { error: unknown }>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await getChatPairs(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
