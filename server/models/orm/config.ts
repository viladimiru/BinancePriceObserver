import {
	getDatabaseName,
	getDatabasePassword,
	getDatabaseUsername,
	getTestDatabaseName,
	getTestDatabasePassword,
	getTestDatabaseUsername,
	isTest,
} from '../../../environment';
import { type Options } from 'sequelize';

export function getOrmConfig(): Options {
	const result: Options = {
		host: '127.0.0.1',
		dialect: 'mysql',
	};

	if (isTest) {
		result.username = getTestDatabaseUsername();
		result.password = getTestDatabasePassword();
		result.database = getTestDatabaseName();
		result.logging = false;
		result.sync = {
			force: true,
		};

		return result;
	}

	result.username = getDatabaseUsername();
	result.password = getDatabasePassword();
	result.database = getDatabaseName();

	return result;
}
