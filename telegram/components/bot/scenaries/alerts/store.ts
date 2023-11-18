import { createStore } from '../../../store-factory';

const store: Partial<
	Record<
		number,
		Partial<{
			chatId: number;
			symbol: string;
			type: string;
			message: string;
			price: number;
		}>
	>
> = {};

export const alertCreationStore = createStore(store);
