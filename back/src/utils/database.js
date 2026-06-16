import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// TODO
// Create the pool to connect to the database
// Use the database settings from the .env file
console.log(process.env);

// Create the connection to database
const pool = await mysql.createConnection({
  host: `${process.env.DB_HOST}:${process.env.DB_PORT}`,// localhost:3456
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});



export { pool };
