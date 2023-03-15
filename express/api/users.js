import userApi from '../../api/userApi.js';
import express from 'express';
import bot from '../../bot.js';
import { get } from '../../storage/index.js';
import { LAST_ACTIVITY } from '../../storage/const.js';
import { isAuthed } from '../middleware/isAuthed.js';
import { apiErrorWrapper } from '../../utils/apiErrorWrapper.js';
import { methodLog } from '../../logs.js';

const Users = express.Router();

Users.get('/list', isAuthed, async (_, res) => {
	try {
		const users = await userApi.getUsers();
		res.status(200).json(users);
	} catch {
		res
			.status(400)
			.send(apiErrorWrapper(methodLog('/list', 400, 'Get Users list error')));
	}
});

Users.post('/mailing', isAuthed, async (req, res) => {
	try {
		const { message, options = {} } = req.body;
		if (!message) {
			res.status(422).send({
				message: 'Message is required',
			});
		} else {
			const users = await userApi.getUsers();
			users.forEach((user) => {
				bot.sendMessage(user.chatId, message, options);
			});
			res.sendStatus(200);
		}
	} catch {
		res
			.status(500)
			.send(apiErrorWrapper(methodLog('/mailing', 500, 'Users mailing error')));
	}
});

Users.post('/mailing/to/:chatId', isAuthed, async (req, res) => {
	try {
		const chatId = Number(req.params.chatId);
		const { message, options = {} } = req.body;
		if (chatId !== chatId) {
			res.status(422).send({
				message: 'ChatId should be a number',
			});
		} else if (!message) {
			res.status(422).send({
				message: 'Message is required',
			});
		} else {
			try {
				await bot.sendMessage(chatId, message, options);
				res.sendStatus(200);
			} catch (e) {
				res
					.status(500)
					.send(apiErrorWrapper(methodLog('/mailing', 500, e.message)));
			}
		}
	} catch {
		res.sendStatus(400);
	}
});

Users.get('/last-activity', isAuthed, (_, res) => {
	const data = Object.entries(get(LAST_ACTIVITY)).map(([key, value]) => ({
		chatId: Number(key),
		...value,
	}));
	res.send(data);
});

export default Users;
