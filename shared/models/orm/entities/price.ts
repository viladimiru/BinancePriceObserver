export interface PriceCreationEntity {
	type: string;
	price: number;
	message: string;
	chatId: number;
	PairId: number;
}

export interface PriceEntity extends PriceCreationEntity {
	id: number;
}
