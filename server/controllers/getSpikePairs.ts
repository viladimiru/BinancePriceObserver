import { type Request, type Response } from 'express';
import { getSpikePairs } from '../models/spike';

export async function getSpikePairsController(
	request: Request,
	response: Response<
		Awaited<ReturnType<typeof getSpikePairs>> | { error: unknown }
	>
): Promise<void> {
	try {
		const result = await getSpikePairs({ symbol: request.params.symbol });
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
