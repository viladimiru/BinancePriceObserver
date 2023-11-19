import { type Request } from 'express';
import { getPairs } from '../models/pair';
import { type PairWithEntities } from '../../shared/models/pair';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function getPairsController(
	_request: Request,
	response: ResponseWithError<PairWithEntities[]>
): Promise<void> {
	try {
		const pairs = await getPairs();
		response.status(200).send(pairs);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
