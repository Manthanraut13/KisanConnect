const { Sequelize } = require('sequelize');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const isSqlite = dbUrl.startsWith('sqlite') || process.env.USE_SQLITE === 'true';

let sequelize;

if (isSqlite) {
  const dbPath = dbUrl.startsWith('sqlite:') ? dbUrl.replace('sqlite:', '') : path.join(__dirname, '../../kisanconnect.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath || path.join(__dirname, '../../kisanconnect.sqlite'),
    logging: false,
  });
} else {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') ? {} : {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  });
}

module.exports = { sequelize };
