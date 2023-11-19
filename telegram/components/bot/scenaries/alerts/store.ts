import { createStore } from '../../../store-factory';

export interface AlertCreationEntity {
	chatId: number;
	symbol: string;
	type: 'SPIKE' | 'ABOVE' | 'BELOW';
	message: string;
	price: number;
}

const store: Partial<Record<number, Partial<AlertCreationEntity>>> = {};

export const alertCreationStore = createStore(store);
