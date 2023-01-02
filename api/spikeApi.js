

async function getSpikePairs(symbol) {
	const result = await SPIKE.findAll({
		include: {
			model: PAIR,
			where: {
				symbol: symbol,
			},
			attributes: [],
		},
	});
	return result.map((item) => item.get({ plain: true }));
}

export default {
	getSpikePairs,
}