import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'
import sqlite3 from 'sqlite3/lib/sqlite3.js';

dotenv.config()

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3,
  storage: process.env.DB_LINK,
  logging: false,
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci', 
  }
});

export default sequelize