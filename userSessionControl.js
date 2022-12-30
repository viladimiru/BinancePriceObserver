import { USER_SESSION } from './sequelize.js';

export async function getSession(userId) {
	let [result, isCreated] = await USER_SESSION.findOrCreate({
		where: {
			userId: userId,
		},
		defaults: {
			step: 'START',
		},
		raw: true,
	});
	if (isCreated) result = result.get({ plain: true });
	return result;
}

export async function setSession(userId) {
	return await USER_SESSION.findOrCreate({
		where: {
			userId: userId,
		},
		default: {
			step: 'START',
		},
	});
}

export async function updateSession(userId, step) {
	return await USER_SESSION.update(
		{
			userId: userId,
			step: step,
		},
		{
			where: {
				userId: userId,
			},
		}
	);
}
