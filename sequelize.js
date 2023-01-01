import { Sequelize, DataTypes } from 'sequelize';

import dotenv from 'dotenv'
dotenv.config()

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

export const PRICE = sequelize.define('Price', {
  type: DataTypes.STRING,
  price: DataTypes.NUMBER,
  message: DataTypes.STRING,
  chatId: DataTypes.NUMBER,
})

export const SPIKE = sequelize.define('Spike', {
  chatId: DataTypes.NUMBER
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
  message: DataTypes.STRING,
})

export const TRADE = sequelize.define('Trade', {
  chatId: DataTypes.NUMBER,
  type: DataTypes.ENUM('LONG', 'SHORT'),
  markPrice: DataTypes.NUMBER,
  shoulder: DataTypes.NUMBER,
})

export const TEMP_TRADE = sequelize.define('TempTrade', {
  chatId: DataTypes.NUMBER,
  symbol: DataTypes.STRING,
  type: DataTypes.ENUM('LONG', 'SHORT'),
  markPrice: DataTypes.NUMBER,
  shoulder: DataTypes.NUMBER,
})

export const FEEDBACK = sequelize.define('Feedback', {
  msg: DataTypes.STRING
})

PAIR.hasMany(PRICE, {
  as: 'prices',
  onDelete: 'cascade',
});
PAIR.hasMany(SPIKE, {
  as: 'spikes',
  onDelete: 'cascade',
})
PAIR.hasMany(TRADE, {
  as: 'trades',
  onDelete: 'cascade',
})
TRADE.belongsTo(PAIR)
PRICE.belongsTo(PAIR)
SPIKE.belongsTo(PAIR)

await sequelize.sync();