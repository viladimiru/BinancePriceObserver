import express from 'express';
import cors from 'cors';
import type e from 'cors';

export const app = express();
const whitelist = ['http://localhost:3000', 'https://www.lk.flamingo-house.top'];

const corsOptions: e.CorsOptions = {
	origin: whitelist,
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.SERVER_PORT;
app.listen(port, () => {
	console.log(`Express server is listening on ${port}`);
});
