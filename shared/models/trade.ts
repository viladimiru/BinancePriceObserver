import { type PairEntity } from './orm/entities/pair';
import {
	type TradeCreationEntity,
	type TradeEntity,
} from './orm/entities/trade';

export type CreateTrade = (
	arg1: TradeCreationEntity & Pick<PairEntity, 'symbol'>
) => Promise<void>;
export type GetChatTrades = (
	arg1: Pick<TradeCreationEntity, 'chatId'>
) => Promise<Array<PairEntity & { trades: TradeEntity[] }>>;
export type RemoveTrade = (
	arg1: Pick<TradeEntity, 'chatId' | 'type' | 'markPrice'> &
		Pick<PairEntity, 'symbol'>
) => Promise<void>;
export type IsChatTradeExist = (
	arg1: Pick<TradeEntity, 'chatId' | 'type' | 'markPrice'> &
		Pick<PairEntity, 'symbol'>
) => Promise<boolean>;
export type GetChatTradesByPairs = (arg1: {
	pairs: Array<PairEntity['symbol']>;
}) => Promise<Array<TradeEntity & { Pair: PairEntity }>>;
