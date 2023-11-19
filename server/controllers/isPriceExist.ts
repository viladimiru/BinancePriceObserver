import { type Request } from 'express';
import { isPriceExist } from '../models/price';
import {
	type ResponseWithError,
	controllerErrorHandler,
} from '../models/controller-error-handler';

export async function isPriceExistController(
	request: Request,
	response: ResponseWithError<boolean>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await isPriceExist(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
