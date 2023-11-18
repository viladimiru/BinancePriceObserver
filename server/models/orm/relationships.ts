import { type createPairModel } from './entities/pair';
import { type createPriceModel } from './entities/price';
import { type createSpikeModel } from './entities/spike';
import { type createTradeModel } from './entities/trade';
import { type createUserModel } from './entities/user';

export function setRelationships(
	pair: ReturnType<typeof createPairModel>,
	price: ReturnType<typeof createPriceModel>,
	spike: ReturnType<typeof createSpikeModel>,
	trade: ReturnType<typeof createTradeModel>,
	user: ReturnType<typeof createUserModel>
): void {
	pair.hasMany(price, {
		as: 'prices',
		onDelete: 'cascade',
	});
	pair.hasMany(spike, {
		as: 'spikes',
		onDelete: 'cascade',
	});
	pair.hasMany(trade, {
		as: 'trades',
		onDelete: 'cascade',
	});
	trade.belongsTo(pair);
	price.belongsTo(pair);
	spike.belongsTo(pair);
	spike.belongsTo(user, {
		foreignKey: 'chatId',
		targetKey: 'chatId',
	});
}
