import { type Request, type Response } from 'express';
import { isSpikeExist } from '../models/spike';

export async function isSpikeExistController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		// @ts-expect-error parse query
		const result = await isSpikeExist(request.query);
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
