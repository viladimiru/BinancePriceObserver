
import express from 'express';
import feedbackApi from '../../api/feedbackApi.js';

const Feedback = express.Router();

Feedback.get('/list', async (_, res) => {
	try {
		const list = await feedbackApi.getAll();
		res.status(200).json(list || []);
	} catch {
		res.sendStatus(400)
	}
});

export default Feedback