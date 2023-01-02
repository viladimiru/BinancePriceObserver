import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const PRICE = sequelize.define('Price', {
  type: DataTypes.STRING,
  price: DataTypes.NUMBER,
  message: DataTypes.STRING,
  chatId: DataTypes.NUMBER,
})

export default PRICE