import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type PriceCreationEntity,
	type PriceEntity,
} from '../../../../shared/models/orm/entities/price';

export function createPriceModel(orm: Sequelize): ModelDefined<PriceEntity, PriceCreationEntity> {
	return orm.define('Price', {
		type: DataTypes.STRING,
		price: DataTypes.INTEGER,
		message: DataTypes.STRING,
		chatId: DataTypes.INTEGER,
	});
}
