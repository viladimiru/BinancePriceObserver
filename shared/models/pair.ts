import { type Includeable } from 'sequelize';
import { type PairEntity } from './orm/entities/pair';
import { type PriceEntity } from './orm/entities/price';
import { type SpikeEntity } from './orm/entities/spike';

export interface CreatePairParams {
	symbol: string;
	type: 'SPIKE' | 'PRICE';
	chatId: number;
	message: string;
	price: number;
}

export interface PairWithEntities extends PairEntity {
	spikes: SpikeEntity[];
	prices: PriceEntity[];
}

export type CreatePair = (arg1: CreatePairParams) => Promise<void>;
export type FindPair = (arg1: {
	symbol: string;
}, arg2?: Includeable) => Promise<PairEntity | undefined>;
export type GetPairs = () => Promise<PairWithEntities[]>;
export type GetChatPairs = (arg1: {
	chatId: number;
	symbol: string;
}) => Promise<PairWithEntities[]>;
export type UpdatePairPrice = (arg1: {
	symbol: string;
	markPrice: number;
}) => Promise<void>;
export type GetChatPairsRaw = (arg1: { chatId: number }) => Promise<string[]>;
export type GetAlertSymbols = (arg1: { chatId: number }) => Promise<string[]>;
export type IsAlertSymbolExist = (arg1: {
	symbol: string;
	chatId: number;
}) => Promise<boolean>;
