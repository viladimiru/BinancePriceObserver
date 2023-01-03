import TelegramApi from 'node-telegram-bot-api';
import { InitObserver } from './subscription.js';
import steps from './steps/index.js';
import { register, BOT_MESSANGER, PAIR_STATS } from './storage/index.js';
import sessionApi from './api/sessionApi.js';
import dict from './dict/lang/index.js';
import express from 'express'

const isDevelopment = process.env.NODE_ENV === 'development';

const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;
let bot;
if (!isDevelopment) {
	bot = new TelegramApi(token);
	bot.setWebHook(process.env.URL + '/bot' + token);
} else {
	bot = new TelegramApi(token, { polling: true });
}
register(PAIR_STATS, []);
register(BOT_MESSANGER, bot.sendMessage.bind(bot));

bot.setMyCommands([
	{
		description: dict.start,
		command: '/start',
	},
]);

bot.on('message', onMessage);

InitObserver(bot);

bot.onText(/^\/start$/, async function (msg) {
	const userId = msg.from.id;
	await sessionApi.updateSession(userId, steps.START.id);
	bot.sendMessage(msg.chat.id, steps.START.text, {
		parse_mode: 'HTML',
		...steps.START.keyboard,
	});
});

async function onMessage(msg) {
	if (msg.text.startsWith('/')) return;

	const userId = msg.from.id;

	if (msg.text === dict.toTheMain) {
		await sessionApi.updateSession(userId, steps.START.id);
		bot.sendMessage(msg.chat.id, steps.START.text, {
			parse_mode: 'HTML',
			...steps[steps.START.id].keyboard,
		});
		return;
	}

	const session = await sessionApi.getSession(userId);

	if (msg.text === dict.back) {
		let prevStep;
		try {
			prevStep = steps[session.step].getPrev(msg);
		} catch {
			prevStep = steps.START.id;
		}
		await sessionApi.updateSession(userId, prevStep);
		sendMessage(msg.chat.id, steps[prevStep].text, {
			...steps[prevStep].keyboard,
			parse_mode: 'HTML',
		});
	} else if (
		steps[session.step].expects &&
		!steps[session.step].expects.includes(msg.text)
	) {
		sendMessage(msg.chat.id, dict.iDontUnderstand);
	} else if (
		steps[session.step].validate &&
		!(await steps[session.step].validate(msg))
	) {
		sendMessage(msg.chat.id, steps[session.step].errorText);
	} else {
		if (
			steps[session.step].onAnswer &&
			typeof steps[session.step].onAnswer === 'function'
		) {
			await steps[session.step].onAnswer(msg);
		}

		let nextStep;
		try {
			nextStep = steps[session.step].getNext(msg) || 'START';
		} catch {
			nextStep = 'START';
		}

		const nextStepKeyboard =
			typeof steps[nextStep].keyboard === 'function'
				? await steps[nextStep].keyboard(msg)
				: steps[nextStep].keyboard;

		await sessionApi.updateSession(userId, nextStep);
		const sentMsg = await sendMessage(msg.chat.id, steps[nextStep].text, {
			...nextStepKeyboard,
			parse_mode: 'HTML',
		});
		if (
			steps[nextStep].cbOnSend &&
			typeof steps[nextStep].cbOnSend === 'function'
		) {
			steps[nextStep].cbOnSend(sentMsg);
		}
	}
}

bot.on('polling_error', console.log);

function sendMessage(chatId, msg, options = {}) {
	return bot.sendMessage(chatId, msg, options);
}


const app = express()

app.use(express.json())

app.post(`/bot${token}`, (req, res) => {
	bot.processUpdate(req.body)
	res.sendStatus(200)
})

app.listen(process.env.PORT, () => {
  console.log(`Express server is listening on ${process.env.PORT}`);
});