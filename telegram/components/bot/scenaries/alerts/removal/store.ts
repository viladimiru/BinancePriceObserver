import { createStore } from '../../../../store-factory';

type AlertRemovalStore = Record<string, { symbol: string }>;

const store: Partial<AlertRemovalStore> = {};

export const alertRemovalStore = createStore(store);
