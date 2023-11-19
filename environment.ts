import dotenv from 'dotenv';

dotenv.config();

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
export const isPooling = process.env.NODE_ENV === 'pooling';
export const getBotToken = (): string => {
	const token = isDevelopment ? process.env.TEST_TOKEN : process.env.TOKEN;
	if (!token) {
		throw new Error('missing token');
	}

	return token;
};
export const isProdTest = process.env.NODE_ENV === 'prod-test';

export const getDatabaseName = (): string => {
	if (!process.env.DB_NAME) {
		throw new Error('missing process.env.DB_NAME');
	}
	return process.env.DB_NAME;
};

export const getDatabaseUsername = (): string => {
	if (!process.env.DB_USERNAME) {
		throw new Error('missing process.env.DB_USERNAME');
	}
	return process.env.DB_USERNAME;
};
export const getDatabasePassword = (): string => process.env.DB_PASSWORD || '';

export const getTestDatabaseUsername = (): string => {
	if (!process.env.DB_TEST_USERNAME) {
		throw new Error('missing process.env.DB_TEST_USERNAME');
	}
	return process.env.DB_TEST_USERNAME;
};

export const getTestDatabaseName = (): string => {
	if (!process.env.DB_TEST_NAME) {
		throw new Error('missing process.env.DB_TEST_NAME');
	}
	return process.env.DB_TEST_NAME;
};

export const getTestDatabasePassword = (): string => process.env.DB_TEST_PASSWORD || '';
