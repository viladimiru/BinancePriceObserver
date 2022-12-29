import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize(
	'database',
	process.env.USER,
	process.env.PASSWORD,
	{
		host: '0.0.0.0',
		dialect: 'sqlite',
		pool: {
			max: 5,
			min: 0,
			idle: 10000,
		},
		// Data is stored in the file `database.sqlite` in the folder `db`.
		// Note that if you leave your app public, this database file will be copied if
		// someone forks your app. So don't use it to store sensitive information.
		storage: './db.sqlite',
	}
);

export const PAIR = sequelize.define('Pair', {
	symbol: DataTypes.STRING,
});

export const TRIGGER = sequelize.define('Trigger', {
	chatId: DataTypes.NUMBER,
	symbol: DataTypes.STRING,
	pairId: DataTypes.NUMBER,
});

PAIR.hasMany(TRIGGER, { as: 'Trigger' });
TRIGGER.belongsTo(PAIR);

await sequelize.sync({
	force: true,
});

await PAIR.create({
	symbol: 'BTCUSDT',
});

await TRIGGER.create({
	chatId: 23332,
	symbol: 'BTCUSDT',
	pairId: 1,
});

// console.log(await PAIR.findByPk(1, {
//   include: ['Trigger']
// }))
