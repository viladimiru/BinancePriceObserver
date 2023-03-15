import { get, set } from './storage/index.js';
import { LOGS } from './storage/const.js';
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	defaultMeta: {
		service: 'binance-price-bot',
	},
	transports: [
		new transports.File({ filename: 'err.log', level: 'error' }),
		new transports.File({ filename: 'combined.log' }),
	],
});

const limit = 2000;

function addLog(data) {
	logger.info(data);
	let logs = get(LOGS);
	if (Array.isArray(data)) {
		const commonLength = logs.length + data.length;
		logs = [
			...data,
			...(commonLength > limit ? logs.slice(0, commonLength - limit) : logs),
		];
	} else {
		logs = [data, ...(logs.length > limit ? logs.slice(0, limit - 1) : logs)];
	}
	set(LOGS, logs);
}

function getLogs() {
	return get(LOGS);
}

export { addLog, getLogs };
