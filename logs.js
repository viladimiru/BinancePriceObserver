import { createLogger, format, transports } from 'winston';

// 10 mb
const maxLogSize = 1024 * 1024 * 10;

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
		new transports.File({
			filename: 'err.log',
			level: 'error',
			maxsize: maxLogSize,
		}),
		new transports.File({ filename: 'combined.log', maxsize: maxLogSize }),
	],
});

function getLogs(query) {
	return new Promise((resolve, reject) => {
		logger.query(
			{
				rows: 2000,
				fields: ['message', 'timestamp', 'level'],
				...query,
			},
			(error, result) => {
				if (error) reject(error);
				else resolve(result.file);
			}
		);
	});
}

function methodLog(method, status, message) {
	const log = [`[${method}]`, status, message].join(' | ');
	logger.error(log);
	return message;
}

export { getLogs, methodLog };
