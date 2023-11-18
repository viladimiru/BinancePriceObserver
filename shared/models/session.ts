import {
	type SessionCreationEntity,
	type SessionEntity,
} from './orm/entities/session';

export type GetSession = (
	arg1: Pick<SessionEntity, 'userId'>
) => Promise<SessionEntity>;
export type UpdateSession = (arg1: SessionCreationEntity) => Promise<void>;
