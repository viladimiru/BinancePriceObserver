import { PAIR_STATS, BOT_MESSANGER } from './const.js';

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

export { PAIR_STATS, BOT_MESSANGER, register, get, set };
