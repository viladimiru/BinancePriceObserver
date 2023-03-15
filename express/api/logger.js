import { logger } from '../../logs.js';
import express from 'express';

export const Logger = express.Router();

Logger.get('/logs', (_, res) => {
	logger.query(
		{
			rows: 2000,
			fields: ['message', 'timestamp', 'level'],
		},
		(_, result) => {
			res.status(200).json(result);
		}
	);
});
