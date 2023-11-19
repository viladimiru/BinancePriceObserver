import winston from 'winston';

const { timestamp, json, combine } = winston.format;

const maxSize = 1024 * 200;

export function createLogger(serviceName: string, path: string): winston.Logger {
	return winston.createLogger({
		level: 'info',
		format: combine(timestamp(), json()),
		defaultMeta: { service: serviceName },
		transports: [
			new winston.transports.File({
				filename: path.concat('/error.log'),
				level: 'error',
				maxsize: maxSize,
			}),
			new winston.transports.File({ filename: path.concat('/combined.log'), maxsize: maxSize }),
		],
	});
}
