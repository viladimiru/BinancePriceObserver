import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite'
});

export const PAIR = sequelize.define('Pair', {
	symbol: DataTypes.STRING,
});

export const TRIGGER = sequelize.define('Trigger', {
	chatId: DataTypes.NUMBER,
});

export const VALUE = sequelize.define('Value', {
  type: DataTypes.STRING,
  value: DataTypes.NUMBER
})

PAIR.hasMany(TRIGGER);
TRIGGER.hasMany(VALUE)
TRIGGER.belongsTo(PAIR);
VALUE.belongsTo(TRIGGER)

await sequelize.sync({
	force: true,
});