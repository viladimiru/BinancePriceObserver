import { type Request, type Response } from 'express';
import { isAlertSymbolExist } from '../models/pair';

export async function isAlertSymbolExistController(
	request: Request,
	response: Response<boolean | { error: unknown }>
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await isAlertSymbolExist(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
