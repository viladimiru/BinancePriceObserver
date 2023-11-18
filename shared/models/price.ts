import { type PairCreationEntity, type PairEntity } from './orm/entities/pair';
import {
	type PriceCreationEntity,
	type PriceEntity,
} from './orm/entities/price';
import { type PairWithEntities } from './pair';

interface RemovePriceParams {
	symbol: string;
	chatId: number;
	type: string;
	price: number;
}

type IsPriceExistParams = Pick<PriceEntity, 'chatId' | 'type' | 'price'> &
	Pick<PairEntity, 'symbol'>;
export type IsPriceExist = (arg1: IsPriceExistParams) => Promise<boolean>;

export type RemovePrice = (
	arg1: RemovePriceParams
) => Promise<PairWithEntities[]>;
export type CreatePrice = (arg1: PriceCreationEntity) => Promise<void>;

type CreatePriceWithSymbolParams = Omit<PriceCreationEntity, 'PairId'> &
	Pick<PairCreationEntity, 'symbol'>;
export type CreatePriceWithSymbol = (
	arg1: CreatePriceWithSymbolParams
) => Promise<void>;
