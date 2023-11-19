export interface TradeCreationEntity {
	chatId: number;
	type: string;
	markPrice: number;
	shoulder: number;
	PairId: number;
}

export interface TradeEntity extends TradeCreationEntity {
	id: number;
}
