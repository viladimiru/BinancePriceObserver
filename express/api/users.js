
import userApi from '../../api/userApi.js';
import express from 'express';
import bot from '../../bot.js';

const Users = express.Router();

Users.get('/users', async (_, res) => {
	const users = await userApi.getUsers();
	res.json(users);
	res.sendStatus(200);
});

Users.post('/mailing', async (req, res) => {
	const { message, options = {} } = req.body;
	if (!message) {
		res.sendStatus(422);
	} else {
		const users = await userApi.getUsers();
		users.forEach((user) => {
			bot.sendMessage(user.chatId, message, options);
		});
		res.sendStatus(200);
	}
});

Users.post('/mailing/to/:chatId', async (req, res) => {
	const chatId = Number(req.params.chatId);
	const { message, options = {} } = req.body;
	if (chatId !== chatId) {
		res.status(422).send({
			message: 'ChatId should be a number'
		})
	} else if (!message) {
		res.status(422).send({
			message: 'Message is required'
		})
	} else {
		try {
			await bot.sendMessage(chatId, message, options);
			res.sendStatus(200);
		} catch (e) {
			res.status(422).send({
				error: e.message
			})
		}
	}
});

export default Users