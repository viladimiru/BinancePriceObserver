import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const TRADE = sequelize.define('Trade', {
  chatId: DataTypes.NUMBER,
  type: DataTypes.ENUM('LONG', 'SHORT'),
  markPrice: DataTypes.NUMBER,
  shoulder: DataTypes.NUMBER,
})

export default TRADE