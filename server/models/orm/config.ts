import { getDatabaseName, getDatabasePassword, getDatabaseUsername, getTestDatabaseName, isTest } from '../../../environment';
import { type Options } from 'sequelize';

export function getOrmConfig(): Options {
	const result: Options = {
		host: 'localhost',
		dialect: 'mysql',
	}

	if (isTest) {
		// TODO: add for test environment separate username and password
		result.database = getTestDatabaseName();
		result.username = getDatabaseUsername();
		result.password = getDatabasePassword();
		result.logging = false;
		result.sync = {
			force: true,
		}

		return result;
	}

	result.username = getDatabaseUsername();
	result.password = getDatabasePassword();
	result.database = getDatabaseName();

	return result;
}
