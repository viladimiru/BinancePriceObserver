import TelegramApi from 'node-telegram-bot-api';
import { Subscription, InitObserver } from './subscription.js';
import { addPair } from './pairsControl.js';
import {
	getCurrentKeyboard,
	getCurrentStepMessage,
	setNextState,
	setObserver,
	ADD_OBSERVER_MSG,
  SYMBOL_MSG,
  START_MSG,
} from './keyboardsControl.js';
import { ADD_OBSERVER } from './dict.js';

const TOKEN = '5840210643:AAFh8evF_ujub-jP3WabpEk09YDXoVDhS94';

const bot = new TelegramApi(TOKEN, { polling: true });

// bot.on('message', onMessage);
bot.onText(/\/start/, function (msg) {
	const {
		chat: { id },
	} = msg;
	bot.sendMessage(id, START_MSG.text, {
    ...START_MSG.state,
    parse_mode: 'HTML'
  })
});

bot.onText(new RegExp(ADD_OBSERVER), function (msg) {
	const {
		chat: { id },
	} = msg;
	bot.sendMessage(id, ADD_OBSERVER_MSG.text, ADD_OBSERVER_MSG.state).then((addObsRes) => {
	});
});

InitObserver(bot);

// function onMessage(msg) {
// 	console.log('on message');
// 	setNextState(msg.text);
// 	setObserver((pair) => {
// 		addPair(pair.symbol, pair.type, pair.price, msg.chat.id);
// 		Subscription(pair.symbol);
// 	});
// 	sendMessage(msg.chat.id, getCurrentStepMessage(), {
// 		...getCurrentKeyboard(),
// 		parse_mode: 'HTML',
// 	});
// }

bot.on('polling_error', console.log);

function sendMessage(chatId, msg, options = {}) {
	bot.sendMessage(chatId, msg, options);
}
