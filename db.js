const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL manque dans le fichier .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("error", (erreur) => {
  console.error("Erreur de connexion PostgreSQL :", erreur.message);
});

module.exports = pool;
