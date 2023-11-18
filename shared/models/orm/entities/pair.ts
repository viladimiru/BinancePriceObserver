export interface PairCreationEntity {
	symbol: string;
	markPrice?: number;
}

export interface PairEntity extends PairCreationEntity {
	id: number;
}
