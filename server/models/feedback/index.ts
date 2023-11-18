import { type AddFeedback } from '../../../shared/models/feedback';
import { type FeedbackCreationEntity } from '../../../shared/models/orm/entities/feedback';
import { FEEDBACK } from '../orm/index';

export const addFeedback: AddFeedback = async (
	params: FeedbackCreationEntity
) => {
	await FEEDBACK.create(params);
};
