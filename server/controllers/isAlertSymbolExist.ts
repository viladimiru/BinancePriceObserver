import { type Request } from 'express';
import { isAlertSymbolExist } from '../models/pair';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function isAlertSymbolExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await isAlertSymbolExist(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
