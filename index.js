import { InitObserver } from './subscription.js';
import steps from './steps/index.js';
import {
	register,
	BOT_MESSANGER,
	PAIR_STATS,
	LOGS,
	set,
} from './storage/index.js';
import sessionApi from './api/sessionApi.js';
import dict from './dict/lang/index.js';
import userApi from './api/userApi.js';
import { server } from './express/index.js';
import bot from './bot.js';
import dotenv from 'dotenv';
import { LAST_ACTIVITY } from './storage/const.js';
import { addLastActivity } from './last-activity.js';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';
const isPooling = process.env.NODE_ENV === 'pooling';
const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;

register(PAIR_STATS, []);
register(BOT_MESSANGER, bot.sendMessage.bind(bot));
register(LOGS, []);
register(LAST_ACTIVITY, {});

bot.setMyCommands([
	{
		description: dict.start,
		command: '/start',
	},
]);

bot.on('message', onMessage);

InitObserver(bot);

bot.onText(/^\/start$/, async function (msg) {
	await userApi.createUser(msg);
	const userId = msg.from.id;
	await sessionApi.updateSession(userId, steps.START.id);
	bot.sendMessage(
		process.env.ADMIN_CHAT_ID,
		[
			'<b>Новый пользователь</b>',
			`<i>${msg.from.first_name + (msg.from.last_name || '')} | @${
				msg.from.username
			} | ${msg.from.language_code}</i>`,
		].join('\n'),
		{
			parse_mode: 'HTML',
		}
	);
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
		const prevStepKeyboard =
			typeof steps[prevStep].keyboard === 'function'
				? await steps[prevStep].keyboard(msg)
				: steps[prevStep].keyboard;
		await sessionApi.updateSession(userId, prevStep);
		sendMessage(msg.chat.id, steps[prevStep].text, {
			...prevStepKeyboard,
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
	addLastActivity(msg);
}

bot.on('polling_error', console.log);

function sendMessage(chatId, msg, options = {}) {
	return bot.sendMessage(chatId, msg, options);
}
if (!isPooling) {
	server.post(`/tghook/bot${token}`, (req, res) => {
		bot.processUpdate(req.body);
		res.sendStatus(200);
	});
}
