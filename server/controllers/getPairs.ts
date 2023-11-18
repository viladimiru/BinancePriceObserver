import { type Request, type Response } from 'express';
import { getPairs } from '../models/pair';
import { type PairWithEntities } from '../../shared/models/pair';

export async function getPairsController(
	_request: Request,
	response: Response<PairWithEntities[] | { error: unknown }>
): Promise<void> {
	try {
		const pairs = await getPairs();
		response.status(200).send(pairs);
	} catch (error) {
		response.status(500).send({ error });
	}
}
