import { type Message } from 'node-telegram-bot-api';
import { type BotMessage } from '.';
import { type ReplyMarkupReturnType } from '../utils/keyboard';

interface Scenary {
	id: string;
	text: (message: BotMessage) => string;
	expects?: (message: BotMessage) => string[];
	validate?: (message: BotMessage) => Promise<boolean> | boolean;
	keyboard: (
		message: BotMessage
	) => Promise<ReplyMarkupReturnType> | ReplyMarkupReturnType;
	errorText?: (message: BotMessage) => string;
	cbOnSend?: (message: BotMessage | Message) => Promise<void> | void;
	onAnswer?: (message: BotMessage) => Promise<void> | void;
}

interface Extra {
	getNextId: (message: BotMessage) => string | undefined;
	getPrevId: (message: BotMessage) => string | undefined;
}

type InitializedScenary = Extra & Scenary;

interface SetControlScenaries extends Pick<Scenary, 'id'> {
	setGuidance: (arg1?: Partial<Extra>) => InitializedScenary;
}

type ScenaryInstance = (arg1: Scenary) => SetControlScenaries;

type ScenaryGetType = (key?: string) => InitializedScenary & {
	getPrev: (message: BotMessage) => InitializedScenary;
	getNext: (message: BotMessage) => InitializedScenary;
};

type CreateScenary = (arg1: {
	views: InitializedScenary[];
	mainView: Pick<Scenary, 'id'>;
}) => {
	getMain: () => InitializedScenary;
	get: ScenaryGetType;
};

export const createView: ScenaryInstance = (scenary) => {
	return {
		id: scenary.id,
		setGuidance: (callbacks) =>
			Object.assign({}, scenary, {
				getNextId: callbacks?.getNextId || (() => undefined),
				getPrevId: callbacks?.getPrevId || (() => undefined),
			}),
	};
};

export const createScenary: CreateScenary = ({ views, mainView }) => {
	const viewsMap = getMappedViews(views);

	const defaultView = viewsMap[mainView.id];
	if (!defaultView) {
		throw new Error('mainView should be registered in viewsMap');
	}

	const get: ScenaryGetType = (key) => {
		let view = defaultView;
		if (key) {
			view = viewsMap[key || ''];
		}
		if (!view) {
			console.error('invalid key, returning mainView', get);
			view = defaultView;
		}

		return {
			...view,
			getPrev: (message: BotMessage) => get(view.getPrevId(message)),
			getNext: (message: BotMessage) => get(view.getNextId(message)),
		};
	};

	return {
		getMain: () => defaultView,
		get,
	};
};

function getMappedViews(
	views: InitializedScenary[]
): Record<string, InitializedScenary> {
	return views.reduce((views, view) => {
		if (views[view.id]) {
			throw new Error(
				['duplicate view id found', JSON.stringify(view)].join(' ')
			);
		}
		views[view.id] = view;
		return views;
	}, {});
}
