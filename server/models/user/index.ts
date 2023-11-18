import { type UserCreationEntity } from '../../../shared/models/orm/entities/user';
import { type CreateUser, type GetUsers } from '../../../shared/models/user';
import { USER } from '../orm';

export const createUser: CreateUser = async (params: UserCreationEntity) => {
	await USER.findOrCreate({
		where: {
			userId: params.userId,
		},
		defaults: params,
	});
};

export const getUsers: GetUsers = async () => {
	const result = await USER.findAll();
	return result.map((item) => item.dataValues);
};
