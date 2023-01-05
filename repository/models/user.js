import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const USER = sequelize.define('User', {
  userId: {
    type: DataTypes.NUMBER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: false,
    unique: true
  },
  chatId: DataTypes.NUMBER,
  firstName: DataTypes.STRING,
  username: DataTypes.STRING,
  lang: DataTypes.STRING,
  isPrivate: DataTypes.BOOLEAN,
  date: DataTypes.NUMBER,
})

export default USER