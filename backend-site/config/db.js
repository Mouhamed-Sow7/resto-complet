const { Pool } = require("pg");

const pool = new Pool({
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  user: "app_user",
  host: "localhost",
  database: "reservation_app",
  password: "secure_password",
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erreur de connexion à la DB:", err.stack);
  }
  console.log("✅ Connecté à PostgreSQL");
  release();
});

module.exports = pool;
