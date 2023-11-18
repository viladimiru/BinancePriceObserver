import { type Request, type Response } from 'express';
import { removeSpike } from '../models/spike';

export async function removeSpikeController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await removeSpike(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
