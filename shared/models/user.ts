import { type UserCreationEntity, type UserEntity } from './orm/entities/user';

export type CreateUser = (arg1: UserCreationEntity) => Promise<void>;
export type GetUsers = () => Promise<UserEntity[]>;
