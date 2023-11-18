import { type Request, type Response } from 'express';
import { createSpikeWithSymbol } from '../models/spike';

export async function createSpikeWithSymbolController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await createSpikeWithSymbol(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({ error });
	}
}
