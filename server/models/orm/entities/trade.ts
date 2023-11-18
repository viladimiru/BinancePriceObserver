import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type TradeCreationEntity,
	type TradeEntity,
} from '../../../../shared/models/orm/entities/trade';

export function createTradeModel(
	orm: Sequelize
): ModelDefined<TradeEntity, TradeCreationEntity> {
	return orm.define('Trade', {
		chatId: DataTypes.INTEGER,
		type: DataTypes.ENUM('LONG', 'SHORT'),
		markPrice: DataTypes.INTEGER,
		shoulder: DataTypes.INTEGER,
	});
}
