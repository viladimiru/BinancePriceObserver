import TelegramApi from 'node-telegram-bot-api';
import { Subscription, InitObserver } from './subscription.js';
import { addPair } from './pairsControl.js';
import { getCurrentKeyboard, getCurrentStepMessage, setNextState, setObserver } from './keyboardsControl.js';

const TOKEN = '5840210643:AAFh8evF_ujub-jP3WabpEk09YDXoVDhS94';

const bot = new TelegramApi(TOKEN, { polling: true });

bot.on('message', onMessage);

InitObserver(bot)

bot.onText(/^\/start$/, function (msg) {
  const opts = getCurrentKeyboard();

  bot.sendMessage(
    msg.chat.id,
    [
      '<b>Добро пожаловать</b>',
      'Выберите нужную функцию'
    ].join('\n\n'),
    {
      parse_mode: 'HTML',
      ...opts
    }
  );
});

function onMessage(msg) {
  setNextState(msg.text)
  setObserver((pair) => {
    addPair(pair.symbol, pair.type, pair.price, msg.chat.id)
    Subscription(pair.symbol)
  })
  sendMessage(
    msg.chat.id,
    getCurrentStepMessage(),
    {
      ...getCurrentKeyboard(),
      parse_mode: 'HTML'
    }
  )
}

bot.on('polling_error', console.log);

function sendMessage(chatId, msg, options = {}) {
	bot.sendMessage(chatId, msg, options);
}
