import { type Response } from 'express';

interface ControllerError {
	error: string;
}

export type ResponseWithError<T = any> = Response<ControllerError | T>;

export function controllerErrorHandler(error: unknown): ControllerError {
	let message = 'Unexpected error';
	if (
		typeof error === 'object' &&
		error &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		message = error.message;
	}

	// TODO: log it somewhere
	console.log(error);

	return {
		error: message,
	};
}
