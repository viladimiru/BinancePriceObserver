import { createStore } from '../../../store-factory';

export interface AlertTradeEntity {
	chatId: number;
	symbol: string;
	type: string;
	markPrice: number;
	shoulder: number;
	spiking?: boolean;
	stopLoss?: number;
	takeProfit?: number;
}

const store: Partial<Record<number, Partial<AlertTradeEntity>>> = {};

export const alertTradeStore = createStore(store);
