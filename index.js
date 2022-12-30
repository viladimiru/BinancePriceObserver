import TelegramApi from 'node-telegram-bot-api';
import { InitObserver } from './subscription.js';
import steps from './steps/index.js';
import { BACK, TO_THE_MAIN } from './textDictionary.js';
import { register } from './storage/index.js';
import { SUBSCRIPTIONS } from './storage/const.js';
import eventBus from './utils/eventBus.js';
import sessionApi from './api/sessionApi.js'

register(SUBSCRIPTIONS, []);

const TOKEN = '5840210643:AAFh8evF_ujub-jP3WabpEk09YDXoVDhS94';

const bot = new TelegramApi(TOKEN, { polling: true });

bot.setMyCommands([]);

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

	if (msg.text === TO_THE_MAIN) {
		await sessionApi.updateSession(userId, steps.START.id);
		bot.sendMessage(msg.chat.id, steps.START.text, {
			parse_mode: 'HTML',
			...steps[steps.START.id].keyboard,
		});
		return;
	}

	const session = await sessionApi.getSession(userId);

	if (msg.text === BACK) {
		const prevStep = steps[session.step].getPrev(msg);
		await sessionApi.updateSession(userId, prevStep);
		sendMessage(msg.chat.id, steps[prevStep].text, {
			...steps[prevStep].keyboard,
			parse_mode: 'HTML',
		});
	} else if (
		steps[session.step].expects &&
		!steps[session.step].expects.includes(msg.text)
	) {
		sendMessage(msg.chat.id, 'Я вас не понимаю');
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
		const nextStep = steps[session.step].getNext(msg);

		const nextStepKeyboard =
			typeof steps[nextStep].keyboard === 'function'
				? await steps[nextStep].keyboard(msg)
				: steps[nextStep].keyboard;

		await sessionApi.updateSession(userId, nextStep);
		sendMessage(msg.chat.id, steps[nextStep].text, {
			...nextStepKeyboard,
			parse_mode: 'HTML',
		});
	}
}

bot.on('polling_error', console.log);

eventBus.on('sendMessage', sendMessage);

function sendMessage(chatId, msg, options = {}) {
	bot.sendMessage(chatId, msg, options);
}
