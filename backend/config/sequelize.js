import config from "./env.js";

export default {
  development: {
    username: config.db.user, // ✅ FIXED: user instead of username
    password: config.db.password,
    database: config.db.name, // ✅ FIXED: name instead of database
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: config.db.user, // ✅ FIXED: user instead of username
    password: config.db.password,
    database: `${config.db.name}_test`, // ✅ FIXED: name instead of database
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: config.db.user, // ✅ FIXED: user instead of username
    password: config.db.password,
    database: config.db.name, // ✅ FIXED: name instead of database
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
