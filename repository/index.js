import PAIR from './models/pair.js';
import PRICE from './models/price.js';
import SPIKE from './models/spike.js';
import TRADE from './models/trade.js';
import sequelize from './sequelize.js';
import USER_SESSION from './models/userSession.js';
import FEEDBACK from './models/feedback.js';
import USER from './models/user.js';

PAIR.hasMany(PRICE, {
	as: 'prices',
	onDelete: 'cascade',
});
PAIR.hasMany(SPIKE, {
	as: 'spikes',
	onDelete: 'cascade',
});
PAIR.hasMany(TRADE, {
	as: 'trades',
	onDelete: 'cascade',
});
TRADE.belongsTo(PAIR);
PRICE.belongsTo(PAIR);
SPIKE.belongsTo(PAIR);
SPIKE.belongsTo(USER, {
	foreignKey: 'chatId',
	targetKey: 'chatId',
});

sequelize.sync();

export { PAIR, PRICE, SPIKE, TRADE, sequelize, USER_SESSION, FEEDBACK, USER };
