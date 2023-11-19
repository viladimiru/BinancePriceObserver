import { createStore } from '../../../store-factory';

export interface AlertCreationEntity {
	chatId: number;
	symbol: string;
	type: string;
	message: string;
	price: number;
}

const store: Partial<Record<number, Partial<AlertCreationEntity>>> = {};

export const alertCreationStore = createStore(store);
