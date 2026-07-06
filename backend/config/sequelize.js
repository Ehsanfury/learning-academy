import config from "./env.js";

export default {
  development: {
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: config.db.username,
    password: config.db.password,
    database: `${config.db.database}_test`,
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
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
  },
};
