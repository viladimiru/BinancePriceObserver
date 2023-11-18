import { type Request, type Response } from 'express';
import { createTrade } from '../models/trade';

export async function createTradeController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await createTrade(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
