import TelegramApi from 'node-telegram-bot-api';
import { isDevelopment, isPooling, isProdTest, getBotToken } from '../../../environment';

let bot: TelegramApi;
if (!isDevelopment && !isPooling && !isProdTest) {
	bot = new TelegramApi(getBotToken());
	bot.setWebHook(process.env.URL + '/tghook/bot' + getBotToken());
} else if (isProdTest) {
	const webHookUrl = process.env.URL + '/tghook-prod-test/bot' + getBotToken();
	bot = new TelegramApi(getBotToken());
	bot.setWebHook(webHookUrl);
} else {
	bot = new TelegramApi(getBotToken(), { polling: true });
}

export default bot;
