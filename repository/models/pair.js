import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const PAIR = sequelize.define('Pair', {
	symbol: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	markPrice: DataTypes.NUMBER,
});

export default PAIR;
