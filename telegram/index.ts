import './webhook.js';

import { InitObserver } from './components/subscription.js';
import {
	register,
	BOT_MESSANGER,
	PAIR_STATS,
	LOGS,
} from './components/storage/index.js';
import { dictionary } from './components/dictionary/index.js';
import { apiClient } from './components/api/index';
import { Bot, scenary, type BotMessage } from './components/bot';

register(PAIR_STATS, []);
register(BOT_MESSANGER, Bot.sendMessage);
register(LOGS, []);

Bot.setCommands([
	{
		description: 'Start',
		command: '/start',
	},
]);

Bot.onMessageCallback(onMessage);

InitObserver();

Bot.onStartCommandCallback(async function (msg) {
	await apiClient.createUser({
		userId: msg.from.id,
		firstName: msg.from.first_name,
		username: msg.chat.username,
		lang: msg.from.language_code,
		isPrivate: msg.chat.type === 'private',
		date: msg.date,
		chatId: msg.chat.id,
	});

	const mainView = scenary.getMain();
	await apiClient.updateSession({
		userId: msg.from.id,
		step: mainView.id,
	});

	const adminChatId = process.env.ADMIN_CHAT_ID;
	if (adminChatId) {
		Bot.sendMessage(
			adminChatId,
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
	}
	Bot.sendMessage(msg.chat.id, mainView.text(msg), {
		parse_mode: 'HTML',
		...(await mainView.keyboard(msg)),
	});
});

async function onMessage(msg: BotMessage): Promise<void> {
	if (msg.text.startsWith('/')) return;

	const userId = msg.from.id;
	const mainView = scenary.getMain();
	const session = await apiClient.getSession({ userId });
	const currentView = scenary.get(session.step);

	try {
		switch (msg.text) {
			case dictionary(msg.from.language_code).toTheMain:
				await apiClient.updateSession({
					userId,
					step: mainView.id,
				});
				Bot.sendMessage(msg.chat.id, mainView.text(msg), {
					parse_mode: 'HTML',
					...(await mainView.keyboard(msg)),
				});
				return;
			case dictionary(msg.from.language_code).back: {
				const prevStep = scenary.get(session.step).getPrev(msg);
				const prevStepKeyboard = await prevStep.keyboard(msg);
				await apiClient.updateSession({
					userId,
					step: prevStep.id,
				});
				Bot.sendMessage(msg.chat.id, prevStep.text(msg), {
					...prevStepKeyboard,
					parse_mode: 'HTML',
				});
				return;
			}
			default: {
				if (
					currentView.expects &&
					!currentView.expects(msg).includes(msg.text)
				) {
					Bot.sendMessage(
						msg.chat.id,
						dictionary(msg.from.language_code).iDontUnderstand
					);
				} else if (currentView.validate && !(await currentView.validate(msg))) {
					if (!currentView.errorText) {
						return;
					}
					Bot.sendMessage(msg.chat.id, currentView.errorText?.(msg));
				} else {
					await currentView.onAnswer?.(msg);

					const nextView = currentView.getNext(msg);

					const nextStepKeyboard = await nextView.keyboard(msg);

					await apiClient.updateSession({
						userId,
						step: nextView.id,
					});
					const sentMsg = await Bot.sendMessage(
						msg.chat.id,
						nextView.text(msg),
						{
							...nextStepKeyboard,
							parse_mode: 'HTML',
						}
					);
					nextView.cbOnSend?.(sentMsg);
				}
			}
		}
	} catch (error) {
		// TODO: add logger on unexpected errors here
		console.log(error);

		await apiClient.updateSession({
			userId,
			step: mainView.id,
		});
		Bot.sendMessage(msg.chat.id, mainView.text(msg), {
			parse_mode: 'HTML',
			...(await mainView.keyboard(msg)),
		});
	}
}

Bot.onPollingErrorCallback(console.log);
