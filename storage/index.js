const state = {};

export function register(key, data) {
	state[key] = data;
}

export function get(key) {
	return state[key];
}

export function set(key, data) {
	state[key] = data;
}
