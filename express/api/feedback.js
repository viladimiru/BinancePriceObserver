import express from 'express';
import feedbackApi from '../../api/feedbackApi.js';
import { isAuthed } from '../middleware/isAuthed.js';
import { methodLog } from '../../logs.js';
import { apiErrorWrapper } from '../../utils/apiErrorWrapper.js';

const Feedback = express.Router();

Feedback.get('/list', isAuthed, async (_, res) => {
	try {
		const list = await feedbackApi.getAll();
		res.status(200).json(list || []);
	} catch {
		res
			.status(500)
			.send(
				apiErrorWrapper(methodLog('/list', 500, 'Get feedback list error'))
			);
	}
});

Feedback.delete('/list/:feedbackId', isAuthed, async (req, res) => {
	const feedbackId = Number(req.params.feedbackId);
	if (feedbackId !== feedbackId) {
		res.status(422).send({
			message: 'Feedback ID should be a number',
		});
	} else {
		try {
			await feedbackApi.deleteFeedback(feedbackId);
			res.sendStatus(200);
		} catch (e) {
			res
				.status(500)
				.send(apiErrorWrapper(methodLog('/list/:feedbackId', 500, e.message)));
		}
	}
});

export default Feedback;
