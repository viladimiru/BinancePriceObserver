import { type PairEntity } from './orm/entities/pair';
import { type SpikeEntity } from './orm/entities/spike';
import { type UserEntity } from './orm/entities/user';
import { type PairWithEntities } from './pair';

type GetSpikePairsReturnType = Array<
	SpikeEntity & {
		Pair: PairEntity;
		User: UserEntity;
	}
>;
export type GetSpikePairs = (arg1: Pick<PairEntity, 'symbol'>) => Promise<GetSpikePairsReturnType>;
export type CreateSpike = (arg1: Pick<SpikeEntity, 'PairId' | 'chatId'>) => Promise<void>;
export type CreateSpikeWithSymbol = (
	arg1: Pick<SpikeEntity, 'chatId'> & Pick<PairEntity, 'symbol'>
) => Promise<void>;
export type RemoveSpike = (
	arg1: Pick<SpikeEntity, 'chatId'> & Pick<PairEntity, 'symbol'>
) => Promise<PairWithEntities[]>;
export type IsSpikeExist = (
	arg1: Pick<SpikeEntity, 'chatId'> & Pick<PairEntity, 'symbol'>
) => Promise<boolean>;
