import { type Request, type Response } from 'express';
import { getChatPairPrices } from '../models/pair';

export async function getChatPairPricesController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		const result = await getChatPairPrices({
			chatId: Number(request.params.chatId),
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
