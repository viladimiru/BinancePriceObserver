import { type Request, type Response } from 'express';
import { removePrice } from '../models/price';

export async function removePriceController(
	request: Request,
	response: Response<Awaited<ReturnType<typeof removePrice>> | { error: unknown }>
): Promise<void> {
	try {
		const result = await removePrice(request.body);
		response.status(200).send(result);
	} catch (error) {
		console.log(error);
		response.status(500).send({
			error,
		});
	}
}
