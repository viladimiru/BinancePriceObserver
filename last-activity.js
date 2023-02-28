import { CACHE, updateCache } from './cache.js';
import { LAST_ACTIVITY } from './storage/const.js';
import { get } from './storage/index.js';

export function addLastActivity(msg) {
	const chatId = msg.chat.id;
	const data = get(LAST_ACTIVITY);
	if (!data[chatId]) {
		data[chatId] = {
			timestamp: Date.now(),
			chatId: Number(chatId),
			userName: msg.from.username,
			messages: [],
		};
	}
	if (data[chatId].messages.length >= 10) {
		data[chatId].messages.splice(0, 1);
	}
	data[chatId].messages.push(msg.text);
	updateCache(CACHE.LAST_ACTIVITY, JSON.stringify(data));
}
