import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type SessionCreationEntity,
	type SessionEntity,
} from '../../../../shared/models/orm/entities/session';

export function createSessionModel(
	orm: Sequelize
): ModelDefined<SessionEntity, SessionCreationEntity> {
	return orm.define('UserSession', {
		userId: {
			type: DataTypes.INTEGER,
			unique: true,
		},
		step: DataTypes.STRING,
	});
}
