import { type Request } from 'express';
import { getChatPairs } from '../models/pair';
import { type PairWithEntities } from '../../shared/models/pair';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function getChatPairsController(
	request: Request,
	response: ResponseWithError<PairWithEntities[]>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await getChatPairs(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
