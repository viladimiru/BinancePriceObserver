import { type Request } from 'express';
import { getSpikePairs } from '../models/spike';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function getSpikePairsController(
	request: Request,
	response: ResponseWithError<Awaited<ReturnType<typeof getSpikePairs>>>
): Promise<void> {
	try {
		const result = await getSpikePairs({ symbol: request.params.symbol });
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
