import { get, set } from './storage/index.js';
import { LOGS } from './storage/const.js';

const limit = 2000;

function addLog(data) {
	let logs = get(LOGS);
	if (Array.isArray(data)) {
		const commonLength = logs.length + data.length
		logs = [...data, ...(commonLength > limit ? logs.slice(0, commonLength - limit) : logs)]
	} else {
		logs = [data, ...(logs.length > limit ? logs.slice(0, limit - 1) : logs)];
	}
	set(LOGS, logs);
}

function getLogs() {
	return get(LOGS);
}

export { addLog, getLogs };
