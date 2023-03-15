import express from 'express';
import bot from '../bot.js';
import Users from './api/users.js';
import Feedback from './api/feedback.js';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { addLog, getLogs } from '../logs.js';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './api/logger.js';

const WsClients = {};

const isDevelopment = process.env.NODE_ENV === 'development';
const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;

const app = express();
const whitelist = [
	'http://localhost:3000',
	'https://www.lk.flamingo-house.top',
];

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
app.use('/api/logger', Logger);

app.post(`/tghook/bot${token}`, (req, res) => {
	bot.processUpdate(req.body);
	res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
	console.log(`Express server is listening on ${process.env.PORT}`);
});

const wsServer = new WebSocketServer({
	port: 3030,
	verifyClient({ req }) {
		return (
			req.headers['sec-websocket-protocol'].indexOf(process.env.API_TOKEN) > -1
		);
	},
});

wsServer.on('connection', onConnection);

function onConnection(wsClient) {
	wsClient.send(JSON.stringify(getLogs()));
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

let lastMailing = null;
let queue = [];

function socketMailing(actionType, data = {}) {
	if (!actionType) {
		throw new Error('Action type is required');
	}
	if (typeof data !== 'object') {
		throw new Error('Throw only objects!');
	}
	const payload = {
		action: actionType,
		data,
		timestamp: Date.now(),
		uid: uuidv4(),
	};
	queue.push(payload);
	if (lastMailing < Date.now() - 900) {
		addLog(queue);
		wsServer.clients.forEach((client) => {
			client.send(JSON.stringify(queue));
		});
		lastMailing = Date.now();
		queue = [];
	}
}

export { app as server, wsServer, socketMailing };
