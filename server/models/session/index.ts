import { type GetSession, type UpdateSession } from '../../../shared/models/session';
import { SESSION } from '../orm';

export const getSession: GetSession = async (params) => {
	let result = await SESSION.findOne({
		where: params,
	});

	if (!result) {
		result = await SESSION.create({
			userId: params.userId,
			step: 'START',
		});
	}

	return result.dataValues;
};

export const updateSession: UpdateSession = async (request) => {
	await SESSION.update(
		{
			userId: request.userId,
			step: request.step,
		},
		{
			where: {
				userId: request.userId,
			},
		}
	);
};
