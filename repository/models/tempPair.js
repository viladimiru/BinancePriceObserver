import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const TEMP_PAIR = sequelize.define('TempPair', {
  chatId: DataTypes.NUMBER,
  symbol: DataTypes.STRING,
  type: DataTypes.STRING,
  price: DataTypes.NUMBER,
  message: DataTypes.STRING,
})

export default TEMP_PAIR