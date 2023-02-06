import { PAIR_STATS, BOT_MESSANGER, LOGS } from './const.js';

const state = {};

function register(key, data) {
	state[key] = data;
}

function get(key) {
	return state[key];
}

function set(key, data) {
	state[key] = data;
}

export { PAIR_STATS, BOT_MESSANGER, LOGS, register, get, set };
