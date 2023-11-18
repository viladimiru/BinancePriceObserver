export interface TradeCreationEntity {
	chatId: number;
	type: 'LONG' | 'SHORT';
	markPrice: number;
	shoulder: number;
	PairId: number;
}

export interface TradeEntity extends TradeCreationEntity {
	id: number;
}
