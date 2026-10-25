import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "chatPassword123",
  database: "users_db",
  multipleStatements: true,
});
export default connection;
