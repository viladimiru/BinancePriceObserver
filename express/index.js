import express from 'express';
import bot from '../bot.js';
import Users from './api/users.js';
import Feedback from './api/feedback.js';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { addLog, getLogs } from '../logs.js';

const WsClients = {};

const isDevelopment = process.env.NODE_ENV === 'development';
const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;

const app = express();
const whitelist = ['http://localhost:3000'];

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', Users);
app.use('/api/feedback', Feedback);

app.post(`/tghook/bot${token}`, (req, res) => {
	bot.processUpdate(req.body);
	res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
	console.log(`Express server is listening on ${process.env.PORT}`);
});

const wsServer = new WebSocketServer({ port: 3030 });

wsServer.on('connection', onConnection);

function onConnection(wsClient) {
	console.log(1)
	wsClient.send(JSON.stringify(getLogs()))
	wsClient.on('message', (client) => {
		const parsedMsg = JSON.parse(client);
		if (!WsClients[parsedMsg.username]) {
			WsClients[parsedMsg.username] = [client];
		}
		if (
			!WsClients[parsedMsg.username].some(
				(item) => Buffer.compare(item, client) === 0
			)
		) {
			WsClients[parsedMsg.username].push(client);
		}
	});
}

function socketMailing(actionType, data = {}) {
	if (!actionType) {
		throw new Error('Action type is required')
	}
	if (typeof data !== 'object') {
		throw new Error('Throw only objects!')
	}
	const payload = {
		action: actionType,
		data,
		timestamp: Date.now()
	}
	addLog(payload)
	wsServer.clients.forEach((client) => {
		client.send(JSON.stringify(payload))
	})
}

export { app as server, wsServer, socketMailing };
