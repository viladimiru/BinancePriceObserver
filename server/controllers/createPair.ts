import { type Request, type Response } from 'express';
import { createPair } from '../models/pair';

export async function createPairController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await createPair(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
