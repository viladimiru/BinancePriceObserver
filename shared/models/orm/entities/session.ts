export interface SessionCreationEntity {
	userId: number;
	step: string;
}

export interface SessionEntity extends SessionCreationEntity {
	id: number;
}
