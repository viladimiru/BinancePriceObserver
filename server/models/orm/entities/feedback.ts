import { DataTypes, type Sequelize, type ModelDefined } from 'sequelize';
import {
	type FeedbackCreationEntity,
	type FeedbackEntity,
} from '../../../../shared/models/orm/entities/feedback';

export function createFeedbackModel(orm: Sequelize): ModelDefined<FeedbackEntity, FeedbackCreationEntity> {
	return orm.define('Feedback', {
		msg: DataTypes.TEXT,
		delete: DataTypes.BOOLEAN,
	});
}
