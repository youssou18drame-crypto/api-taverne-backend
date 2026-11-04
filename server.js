require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const verifierToken = require("./middlewares/auth");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET manque dans le fichier .env");
}

const app = express();
const PORT = process.env.PORT || 3000;
const origineFrontend = process.env.FRONTEND_ORIGIN || "http://localhost:3001";

app.use(cors({ origin: origineFrontend }));
app.use(express.json({ limit: "20kb" }));

// Route publique : authentifier un utilisateur
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || !password) {
    return res.status(400).json({ erreur: "Email et mot de passe requis" });
  }

  try {
    const resultat = await pool.query(
      "SELECT id, email, mot_de_passe FROM utilisateur WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    const utilisateur = resultat.rows[0];
    if (!utilisateur) {
      return res.status(401).json({ erreur: "Identifiants incorrects" });
    }

    const motDePasseValide = await bcrypt.compare(password, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ erreur: "Identifiants incorrects" });
    }

    const token = jwt.sign({ id: utilisateur.id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h"
    });

    return res.status(200).json({ message: "Connexion réussie", token });
  } catch (erreur) {
    console.error("Erreur de connexion :", erreur.message);
    return res.status(500).json({ erreur: "Impossible de se connecter" });
  }
});

// Route protégée : lire l'inventaire
app.get("/api/pnj", verifierToken, async (req, res) => {
  try {
    const resultat = await pool.query("SELECT * FROM personnage ORDER BY id");
    return res.status(200).json(resultat.rows);
  } catch (erreur) {
    console.error("Erreur SQL :", erreur.message);
    return res.status(500).json({ erreur: "Impossible de récupérer les PNJ" });
  }
});

// Route protégée : ajouter un PNJ
app.post("/api/pnj", verifierToken, async (req, res) => {
  const { nom, classe, niveau } = req.body || {};

  if (typeof nom !== "string" || !nom.trim() || nom.length > 100 ||
      typeof classe !== "string" || !classe.trim() || classe.length > 100 ||
      !Number.isInteger(niveau) || niveau < 1 || niveau > 2147483647) {
    return res.status(400).json({
      erreur: "Nom et classe requis (100 caractères maximum), niveau entier positif requis"
    });
  }

  try {
    const resultat = await pool.query(
      "INSERT INTO personnage (nom, classe, niveau) VALUES ($1, $2, $3) RETURNING *",
      [nom.trim(), classe.trim(), niveau]
    );

    return res.status(201).json({
      message: "Le PNJ a rejoint la taverne !",
      personnage: resultat.rows[0]
    });
  } catch (erreur) {
    console.error("Erreur SQL :", erreur.message);
    return res.status(500).json({ erreur: "Impossible de créer le PNJ" });
  }
});

// Route protégée : retrouver un PNJ précis
app.get("/api/pnj/:id", verifierToken, async (req, res) => {
  const idSaisi = Number(req.params.id);

  if (!Number.isInteger(idSaisi) || idSaisi < 1 || idSaisi > 2147483647) {
    return res.status(400).json({ erreur: "L'identifiant doit être un entier positif valide" });
  }

  try {
    const resultat = await pool.query(
      "SELECT * FROM personnage WHERE id = $1",
      [idSaisi]
    );
    if (!resultat.rows.length) {
      return res.status(404).json({ erreur: "PNJ introuvable" });
    }
    return res.status(200).json(resultat.rows[0]);
  } catch (erreur) {
    console.error("Erreur SQL :", erreur.message);
    return res.status(500).json({ erreur: "Impossible de récupérer le PNJ" });
  }
});

// Route du TP précédent : simulation uniquement, aucune suppression SQL
app.delete("/api/pnj/:id", verifierToken, (req, res) => {
  return res.status(200).json({
    message: `Simulation : suppression du PNJ numéro ${req.params.id}`
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
