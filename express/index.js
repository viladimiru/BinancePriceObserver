import express from 'express';
import bot from '../bot.js';
import Users from './api/users.js';
import Feedback from './api/feedback.js';
import cors from 'cors';

const isDevelopment = process.env.NODE_ENV === 'development';
const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;

const app = express();
const whitelist = ['http://localhost:3000'];

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.includes(origin)) {
			console.log('1212')
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

export { app as server };
