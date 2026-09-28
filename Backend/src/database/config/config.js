require("dotenv").config();
const databaseConfig = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "multiDocDB",
  host: process.env.DB_HOST || "127.0.0.1",
  dialect: "mysql"
};

module.exports = databaseConfig;
