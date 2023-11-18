import { type Request, type Response } from 'express';
import { createPriceWithSymbol } from '../models/price';

export async function createPriceWithSymbolController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await createPriceWithSymbol(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({ error });
	}
}
