const mysql = require("mysql2");
const dotenv = require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
};

let connectDB;

function handleDisconnect() {
  connectDB = mysql.createConnection(dbConfig);

  connectDB.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      //setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Connected to the database");
    }
  });

  connectDB.on("error", (err) => {
    if (
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR" ||
      err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR" ||
      err.code === "ECONNRESET" ||
      err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
    ) {
      console.error("Database connection was closed. Reconnecting...");
      handleDisconnect();
    } else {
      // throw err;
      console.log("database connection error:");
    }
  });
}

handleDisconnect(); // Initial connection attempt

module.exports = connectDB;
