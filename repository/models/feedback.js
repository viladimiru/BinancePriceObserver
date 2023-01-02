import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const FEEDBACK = sequelize.define('Feedback', {
  msg: DataTypes.STRING
})

export default FEEDBACK