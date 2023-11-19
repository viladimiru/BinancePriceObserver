import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type SpikeCreationEntity,
	type SpikeEntity,
} from '../../../../shared/models/orm/entities/spike';

export function createSpikeModel(orm: Sequelize): ModelDefined<SpikeEntity, SpikeCreationEntity> {
	return orm.define('Spike', {
		chatId: DataTypes.INTEGER,
	});
}
