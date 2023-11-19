import { type Message } from 'node-telegram-bot-api';
import { type PairWithEntities } from '../../../shared/models/pair.js';
import { type Bot } from '../bot/index.js';
import { BOT_MESSANGER, LOGS, PAIR_STATS } from './const.js';

export { PAIR_STATS, BOT_MESSANGER, LOGS } from './const.js';

const state: {
	[PAIR_STATS]: PairWithEntities[];
	[BOT_MESSANGER]: typeof Bot.sendMessage;
	[LOGS]: any;
} = {
	[PAIR_STATS]: [],
	[BOT_MESSANGER]: async function (): Promise<Message> {
		throw new Error('Function not implemented.');
	},
	[LOGS]: undefined,
};

export function register<T extends keyof typeof state>(key: T, data: (typeof state)[T]): void {
	state[key] = data;
}

function get<T extends keyof typeof state>(key: T): (typeof state)[T] {
	return state[key];
}

export function getPairStats(): PairWithEntities[] {
	return get(PAIR_STATS);
}

export function getBotMessanger(): typeof Bot.sendMessage {
	return get(BOT_MESSANGER);
}

export function setPairStats(data: PairWithEntities[]): void {
	state[PAIR_STATS] = data;
}
