import winston from 'winston';

const { timestamp, json, combine } = winston.format;

export function createLogger(serviceName: string, path: string): winston.Logger {
	return winston.createLogger({
		level: 'info',
		format: combine(timestamp(), json()),
		defaultMeta: { service: serviceName },
		transports: [
			new winston.transports.File({ filename: path.concat('/error.log'), level: 'error' }),
			new winston.transports.File({ filename: path.concat('/combined.log') }),
		],
	});
}
