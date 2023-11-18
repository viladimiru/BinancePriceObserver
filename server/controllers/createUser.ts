import { type Request, type Response } from 'express';
import { createUser } from '../models/user';

export async function createUserController(
	request: Request,
	response: Response
): Promise<void> {
	try {
		await createUser(request.body);
		response.status(200).send();
	} catch (error) {
		response.status(500).send({
			error,
		});
	}
}
