import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite',
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
    unique: true
  },
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

await sequelize.sync({
	force: true,
});

const pair = await PAIR.create({
  symbol: 'BTCUSDT'
})
// const pair2 = await PAIR.create({
//   symbol: 'BNBUSDT'
// })

const trigger = await TRIGGER.create({
  chatId: 803497355,
  PairId: pair.dataValues.id
})

// const trigger2 = await TRIGGER.create({
//   chatId: 803497355,
//   PairId: pair.dataValues.id
// })
// const trigger3 = await TRIGGER.create({
//   chatId: 803497355,
//   PairId: pair.dataValues.id
// })

await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17000,
  message: 'text'
})
await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17100,
  message: 'text'
})
await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17200,
  message: 'text'
})
await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17300,
  message: 'text'
})
await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17400,
  message: 'text'
})
await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17800,
  message: 'text'
})
await PRICE.create({
  TriggerId: trigger.dataValues.id,
  type: 'Long',
  price: 17700,
  message: 'text'
})
// await PRICE.create({
//   TriggerId: trigger2.dataValues.id,
//   type: 'Long',
//   price: 17000,
// })
// await PRICE.create({
//   TriggerId: trigger3.dataValues.id,
//   type: 'Long',
//   price: 17000,
// })

// await USER_SESSION.create({
//   userId: 803497355,
//   step: 'START'
// })