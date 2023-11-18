import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type UserCreationEntity,
	type UserEntity,
} from '../../../../shared/models/orm/entities/user';

export function createUserModel(orm: Sequelize): ModelDefined<UserEntity, UserCreationEntity> {
	return orm.define(
		'User',
		{
			userId: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				autoIncrement: false,
				unique: true,
			},
			chatId: {
				primaryKey: true,
				autoIncrement: false,
				type: DataTypes.INTEGER,
				unique: true,
			},
			firstName: DataTypes.STRING,
			username: DataTypes.STRING,
			lang: DataTypes.STRING,
			isPrivate: DataTypes.BOOLEAN,
			date: DataTypes.INTEGER,
		}
	);
}
