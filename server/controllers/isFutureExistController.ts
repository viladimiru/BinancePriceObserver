import { type Request, type Response } from 'express';
import { isFutureExist } from '../models/future';

export async function isFutureExistController(
	request: Request,
	response: Response<boolean | { error: unknown }>
): Promise<void> {
	try {
		const result = await isFutureExist({
			symbol: request.params.symbol,
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
