/**
 * sequelize.js
 * Path: backend/config/sequelize.js
 * Description: Sequelize CLI configuration
 * Changes:
 * - ✅ FIXED: Proper ES Module export
 */

import config from "./env.js";

export default {
  development: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
  },
  test: {
    username: config.db.user,
    password: config.db.password,
    database: `${config.db.name}_test`,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
  },
  production: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
  },
};
