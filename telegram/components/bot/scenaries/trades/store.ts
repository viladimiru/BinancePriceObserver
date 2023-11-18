import { createStore } from '../../../store-factory';

const store: Partial<
	Record<
		number,
		Partial<{
			chatId: number;
			symbol: string;
			type: string;
			message: string;
			markPrice: number;
			shoulder: number;
			spiking: boolean;
			stopLoss: number;
			takeProfit: number;
		}>
	>
> = {};

export const alertTradeStore = createStore(store);
