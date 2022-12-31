import dotenv from 'dotenv'
dotenv.config()

export default {
  "development": {
    dialect: 'sqlite',
    storage: process.env.DB_LINK,
    logging: false,
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci', 
    }
  },
  "test": {
    dialect: 'sqlite',
    storage: process.env.DB_LINK,
    logging: false,
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci', 
    }
  },
  "production": {
    dialect: 'sqlite',
    storage: process.env.DB_LINK,
    logging: false,
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci', 
    }
  }
}
