import { get, set } from './storage/index.js';
import { LOGS } from './storage/const.js';

const limit = 200;

function addLog(data) {
	let logs = get(LOGS);
	logs = [data, ...(logs.length > limit ? logs.slice(0, limit - 1) : logs)];
	set(LOGS, logs);
}

function getLogs() {
	return get(LOGS);
}

export { addLog, getLogs };
