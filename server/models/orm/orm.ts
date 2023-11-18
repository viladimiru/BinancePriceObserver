import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { getOrmConfig } from './config';

dotenv.config();

export const orm = new Sequelize(getOrmConfig());
