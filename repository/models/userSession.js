import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const USER_SESSION = sequelize.define('UserSession', {
  userId: DataTypes.NUMBER,
  step: DataTypes.STRING
})

export default USER_SESSION