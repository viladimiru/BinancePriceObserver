export interface FeedbackCreationEntity {
	msg: string;
	delete?: boolean;
}

export interface FeedbackEntity extends FeedbackCreationEntity {
	id: number;
}
