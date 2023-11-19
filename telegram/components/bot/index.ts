import { getValidatedLanguage, type Language } from '../../entities/language';
import bot from './instance';
import type TelegramApi from 'node-telegram-bot-api';
import { createScenary } from './scenary';
import { startView } from './scenaries/start';
import { feedbackView } from './scenaries/feedback';
import { dictionary } from '../dictionary';
import { chooseAlertActionView } from './scenaries/alerts/chooseAlertAction';
import { chooseTradeActionView } from './scenaries/trades/chooseTradeAction';
import { quotesView } from './scenaries/quotes';
import { addObserverView } from './scenaries/alerts/creation/addObserver';
import { pairsListView } from './scenaries/alerts/removal/pairsList';
import { choosePairView } from './scenaries/alerts/creation/choosePair';
import { chooseTradeTypeView } from './scenaries/alerts/creation/chooseTradeType';
import { setAlertPriceView } from './scenaries/alerts/creation/setPrice';
import { setAlertMessageView } from './scenaries/alerts/creation/setMessage';
import { alertsListView } from './scenaries/alerts/removal/alertsList';
import { keyboardWrapper } from '../utils/keyboard';
import { selectSymbolView } from './scenaries/trades/creation/selectSymbol';
import { tradeListView } from './scenaries/trades/removal/tradeList';
import { selectTypeView } from './scenaries/trades/creation/selectType';
import { setPriceView } from './scenaries/trades/creation/setPrice';
import { setShoulderView } from './scenaries/trades/creation/setShoulder';
import { setTakeProfitView } from './scenaries/trades/creation/setTakeProfit';
import { setStopLossView } from './scenaries/trades/creation/setStopLoss';
import { setSpikingView } from './scenaries/trades/creation/setSpiking';

export interface BotMessage {
	from: {
		id: number;
		first_name?: string;
		language_code: Language;
		last_name?: string;
		username?: string;
	};
	chat: {
		username?: string;
		type: string;
		id: number;
	};
	date: number;
	text: string;
}

interface BotParams {
	setCommands: TelegramApi['setMyCommands'];
	onMessageCallback: (callback: (message: BotMessage) => Promise<void>) => void;
	onStartCommandCallback: (callback: (message: BotMessage) => Promise<void>) => void;
	sendMessage: TelegramApi['sendMessage'];
	sendErrorMessage: (arg1: BotMessage, error: unknown) => void;
	onPollingErrorCallback: (...args: any[]) => void;
}

export const Bot: BotParams = {
	setCommands: bot.setMyCommands.bind(bot),
	onMessageCallback: bot.on.bind(bot, 'message'),
	// TODO: check type error
	// @ts-expect-error fix types for callback
	onStartCommandCallback: bot.onText.bind(bot, /^\/start$/),
	sendMessage: bot.sendMessage.bind(bot),
	onPollingErrorCallback: bot.on.bind(bot, 'polling_error'),
	sendErrorMessage: function (message, error) {
		console.log('ERROR:', error);
		this.sendMessage(
			message.chat.id,
			dictionary(message.from.language_code).somethingWentWrong,
			keyboardWrapper([], {
				language_code: getValidatedLanguage(message.from.language_code),
			})
		);
	},
};

const startViewWithGuidance = startView.setGuidance({
	getNextId(message) {
		if (message.text === dictionary(message.from.language_code).alerts) {
			return chooseAlertActionView.id;
		}
		if (message.text === dictionary(message.from.language_code).leaveFeedback) {
			return feedbackView.id;
		}
		if (message.text === dictionary(message.from.language_code).trades) {
			return chooseTradeActionView.id;
		}
		if (message.text === dictionary(message.from.language_code).quotes) {
			return quotesView.id;
		}
		return;
	},
});

const feedbackViewWithGuidance = feedbackView.setGuidance();
const quotesViewWithGuidance = quotesView.setGuidance({
	getNextId(message) {
		return message.text === dictionary(message.from.language_code).update ? quotesView.id : 'START';
	},
});

const chooseAlertActionViewWithGuidance = chooseAlertActionView.setGuidance({
	getNextId: (message) => {
		if (message.text === dictionary(message.from.language_code).addObserver) {
			return addObserverView.id;
		}
		if (message.text === dictionary(message.from.language_code).removeObserver) {
			return pairsListView.id;
		}
		return;
	},
});

const chooseTradeTypeViewWithGuidance = chooseTradeTypeView.setGuidance({
	getPrevId: () => addObserverView.id,
	getNextId: (message: BotMessage) => {
		if (message.text !== dictionary(message.from.language_code).spiking) {
			return setAlertPriceView.id;
		}
		return choosePairView.id;
	},
});

const addObserverViewWithGuidance = addObserverView.setGuidance({
	getPrevId: () => chooseAlertActionView.id,
	getNextId: () => chooseTradeTypeView.id,
});

const setAlertPriceWithGuidance = setAlertPriceView.setGuidance({
	getPrevId: () => chooseTradeTypeView.id,
	getNextId: () => setAlertMessageView.id,
});

const setAlertMessageViewWithGuidance = setAlertMessageView.setGuidance({
	getPrevId: () => setAlertPriceView.id,
	getNextId: () => choosePairView.id,
});

const choosePairViewWithGuidance = choosePairView.setGuidance();

const pairsListViewWithGuidance = pairsListView.setGuidance({
	getPrevId: () => choosePairView.id,
	getNextId: () => alertsListView.id,
});

const alertsListViewWithGuidance = alertsListView.setGuidance();

const chooseTradeActionViewWithGuidance = chooseTradeActionView.setGuidance({
	getNextId: (message: BotMessage) => {
		if (message.text === dictionary(message.from.language_code).addTrade) {
			return selectSymbolView.id;
		}
		if (message.text === dictionary(message.from.language_code).removeTrade) {
			return tradeListView.id;
		}
		return 'START';
	},
});

const selectSymbolViewWithGuidance = selectSymbolView.setGuidance({
	getNextId: () => selectTypeView.id,
	getPrevId: () => chooseTradeActionView.id,
});

const selectTypeViewWihtGuidance = selectTypeView.setGuidance({
	getNextId: () => setPriceView.id,
	getPrevId: () => selectSymbolView.id,
});

const setPriceViewWithGuidance = setPriceView.setGuidance({
	getNextId: () => setShoulderView.id,
	getPrevId: () => selectTypeView.id,
});

const setShoulderViewWithGuidance = setShoulderView.setGuidance({
	getNextId: () => setTakeProfitView.id,
	getPrevId: () => setPriceView.id,
});

const setTakeProfitViewWithGuidance = setTakeProfitView.setGuidance({
	getNextId: () => setStopLossView.id,
	getPrevId: () => setShoulderView.id,
});

const setStopLossViewWithGuidance = setStopLossView.setGuidance({
	getNextId: () => setSpikingView.id,
	getPrevId: () => setTakeProfitView.id,
});

const setSpikingViewWithGuidance = setSpikingView.setGuidance({
	getNextId: () => chooseTradeActionView.id,
	getPrevId: () => setStopLossView.id,
});

const tradeListViewWithGuidance = tradeListView.setGuidance();

export const scenary = createScenary({
	views: [
		// Main view
		startViewWithGuidance,

		// Alert view
		chooseAlertActionViewWithGuidance,
		// Alert creation view
		choosePairViewWithGuidance,
		addObserverViewWithGuidance,
		chooseTradeTypeViewWithGuidance,
		setAlertPriceWithGuidance,
		setAlertMessageViewWithGuidance,
		// Alert removal view
		pairsListViewWithGuidance,
		alertsListViewWithGuidance,

		// Trade view
		chooseTradeActionViewWithGuidance,
		// Trade creation view
		selectSymbolViewWithGuidance,
		selectTypeViewWihtGuidance,
		setPriceViewWithGuidance,
		setShoulderViewWithGuidance,
		setTakeProfitViewWithGuidance,
		setStopLossViewWithGuidance,
		setSpikingViewWithGuidance,
		// Trade removal view
		tradeListViewWithGuidance,

		// Quotes view
		quotesViewWithGuidance,

		// Feedback view
		feedbackViewWithGuidance,
	],
	mainView: startView,
});
