import { type Request, type Response } from 'express';
import { isPriceExist } from '../models/price';

export async function isPriceExistController(
	request: Request,
	response: Response<boolean | { error: unknown }>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await isPriceExist(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
