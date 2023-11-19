import { type Request } from 'express';
import { getAlertSymbols } from '../models/pair';
import { type ResponseWithError, controllerErrorHandler } from '../models/controller-error-handler';

export async function getAlertSymbolsController(
	request: Request,
	response: ResponseWithError<string[]>
): Promise<void> {
	try {
		const result = await getAlertSymbols({
			chatId: Number(request.params.chatId),
		});
		response.status(200).send(result);
	} catch (error) {
		response.status(500).send(controllerErrorHandler(error));
	}
}
