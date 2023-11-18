import { type Request, type Response } from 'express';
import { getChatTrades } from '../models/trade';

export async function getChatTradesController(
	request: Request,
	response: Response<
		Awaited<ReturnType<typeof getChatTrades>> | { error: unknown }
	>
): Promise<void> {
	try {
		const result = await getChatTrades({
			chatId: Number(request.params.chatId),
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
