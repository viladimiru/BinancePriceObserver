import { type FeedbackEntity } from './orm/entities/feedback';

export type AddFeedback = (arg1: Pick<FeedbackEntity, 'msg'>) => Promise<void>;
