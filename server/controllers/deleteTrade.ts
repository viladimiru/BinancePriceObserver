import { type Request, type Response } from 'express';
import { removeTrade } from '../models/trade';

export async function deleteTradeController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await removeTrade(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
