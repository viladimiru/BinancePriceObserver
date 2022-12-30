import { Sequelize, DataTypes } from 'sequelize';

console.log('ALERT', process.env.DB_LINK)

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_LINK,
  logging: false,
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci', 
  }
});

export const PAIR = sequelize.define('Pair', {
	symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  markPrice: DataTypes.NUMBER
});

export const TRIGGER = sequelize.define('Trigger', {
	chatId: DataTypes.NUMBER,
});

export const PRICE = sequelize.define('Price', {
  type: DataTypes.STRING,
  price: DataTypes.NUMBER,
  message: DataTypes.STRING
})

export const USER_SESSION = sequelize.define('UserSession', {
  userId: DataTypes.NUMBER,
  step: DataTypes.STRING
})

export const TEMP_PAIR = sequelize.define('TempPair', {
  chatId: DataTypes.NUMBER,
  symbol: DataTypes.STRING,
  type: DataTypes.STRING,
  price: DataTypes.NUMBER,
  message: DataTypes.STRING
})

PAIR.hasMany(TRIGGER, {
  as: 'triggers',
  onDelete: 'cascade',
});
TRIGGER.hasMany(PRICE, {
  as: 'prices',
  onDelete: 'cascade'
})
TRIGGER.belongsTo(PAIR);
PRICE.belongsTo(TRIGGER)

await sequelize.sync();