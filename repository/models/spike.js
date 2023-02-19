import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const SPIKE = sequelize.define('Spike', {
	chatId: DataTypes.NUMBER,
});

export default SPIKE;
