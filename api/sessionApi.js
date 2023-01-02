import { USER_SESSION } from '../repository/index.js';

async function getSession(userId) {
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

async function setSession(userId) {
	return await USER_SESSION.findOrCreate({
		where: {
			userId: userId,
		},
		default: {
			step: 'START',
		},
	});
}

async function updateSession(userId, step) {
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

export default {
  getSession,
  setSession,
  updateSession,
}