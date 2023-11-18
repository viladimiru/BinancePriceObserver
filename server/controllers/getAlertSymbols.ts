import { type Request, type Response } from 'express';
import { getAlertSymbols } from '../models/pair';

export async function getAlertSymbolsController(
	request: Request,
	response: Response<string[] | { error: unknown }>
): Promise<void> {
	try {
		const result = await getAlertSymbols({
			chatId: Number(request.params.chatId),
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
