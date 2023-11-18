import { type CreatePair } from '../../shared/models/pair';
import z from 'zod'

export function validateCreatePairArguments(data: unknown): [Parameters<CreatePair>[0], true] | [undefined, false] {
	const result = z.object({
		symbol: z.string(),
		type: z.string(),
		chatId: z.number(),
		message: z.string(),
		price: z.number(),
	}).safeParse(data)
	if (result.success) {
		return [result.data, true];
	}
	return [undefined, false];
}
