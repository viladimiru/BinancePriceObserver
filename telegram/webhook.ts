import express from 'express';
import bot from './components/bot/instance';
import { isPooling, isProdTest, getBotToken } from '../environment';

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

if (!isPooling) {
	const url = (isProdTest ? '/tghook-prod-test/bot' : '/tghook/bot') + getBotToken();
	server.post(`${url}`, (req, res) => {
		bot.processUpdate(req.body);
		res.sendStatus(200);
	});
}

const port = process.env.WEBHOOK_LISTENER_PORT;

server
	.listen(port, () => {
		console.log(`Express server is listening on ${port}`);
	})
	.on('error', (...args) => {
		console.log('something went wrong', args);
	});
