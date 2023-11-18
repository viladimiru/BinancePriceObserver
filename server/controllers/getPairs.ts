import { type Request, type Response } from 'express';
import { getPairs } from '../models/pair';

export async function getPairsController(
	_request: Request,
	response: Response
): Promise<void> {
	try {
		const pairs = await getPairs();
		response.status(200).send(pairs);
	} catch (error) {
		response.status(500).send({ error });
	}
}
