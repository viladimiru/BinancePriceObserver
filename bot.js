import TelegramApi from 'node-telegram-bot-api';

const isDevelopment = process.env.NODE_ENV === 'development';
const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;

let bot;
if (!isDevelopment) {
	bot = new TelegramApi(token);
	bot.setWebHook(process.env.URL + '/tghook/bot' + token);
} else {
	bot = new TelegramApi(token, { polling: true });
}

export default bot