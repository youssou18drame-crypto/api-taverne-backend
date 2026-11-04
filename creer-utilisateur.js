require("dotenv").config();

const readline = require("node:readline");
const bcrypt = require("bcrypt");
const pool = require("./db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(message) {
  return new Promise(resolve => rl.question(message, resolve));
}

async function main() {
  try {
    console.log("Création d'un compte Maître du Jeu (local uniquement).");
    const email = (await question("Adresse email : ")).trim().toLowerCase();
    const password = await question("Mot de passe (saisie visible dans le terminal) : ");

    if (!email.includes("@") || password.length < 8) {
      console.error("Email invalide ou mot de passe trop court (8 caractères minimum).");
      return;
    }

    const existant = await pool.query(
      "SELECT id FROM utilisateur WHERE email = $1",
      [email]
    );
    if (existant.rows.length > 0) {
      console.log("Un utilisateur possède déjà cette adresse email.");
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO utilisateur (email, mot_de_passe) VALUES ($1, $2)",
      [email, hash]
    );

    console.log("Compte créé ! Vous pouvez vous connecter sur http://localhost:3001");
  } catch (err) {
    console.error("Erreur lors de la création du compte :", err.message);
    console.error("Vérifiez que la table utilisateur existe et que PostgreSQL est accessible.");
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
