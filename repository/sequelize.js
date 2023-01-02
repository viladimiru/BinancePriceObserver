import { Sequelize } from 'sequelize';

import dotenv from 'dotenv'
dotenv.config()

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_LINK,
  logging: false,
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci', 
  }
});

export default sequelize