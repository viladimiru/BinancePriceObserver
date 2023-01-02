import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const TEMP_TRADE = sequelize.define('TempTrade', {
  chatId: DataTypes.NUMBER,
  symbol: DataTypes.STRING,
  type: DataTypes.ENUM('LONG', 'SHORT'),
  markPrice: DataTypes.NUMBER,
  shoulder: DataTypes.NUMBER,
})

export default TEMP_TRADE