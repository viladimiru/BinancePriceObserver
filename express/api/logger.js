import { getLogs, methodLog } from '../../logs.js';
import express from 'express';
import { apiErrorWrapper } from '../../utils/apiErrorWrapper.js';

export const Logger = express.Router();

Logger.get('/logs', async (req, res) => {
	try {
		res.status(200).send(await getLogs(req.query));
	} catch (e) {
		res.status(500).send(apiErrorWrapper(methodLog('/logs', 500, e.message)));
	}
});
