import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type PairCreationEntity,
	type PairEntity,
} from '../../../../shared/models/orm/entities/pair';

export function createPairModel(orm: Sequelize): ModelDefined<PairEntity, PairCreationEntity> {
	return orm.define('Pair', {
		symbol: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		markPrice: DataTypes.INTEGER,
	});
}
