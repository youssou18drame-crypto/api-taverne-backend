const jwt = require("jsonwebtoken");

module.exports = function verifierToken(req, res, next) {
  const entete = req.headers.authorization || "";
  const [schema, token, extra] = entete.split(" ");

  if (schema !== "Bearer" || !token || extra) {
    return res.status(401).json({ erreur: "Token JWT manquant ou mal formé" });
  }

  try {
    const utilisateur = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    req.utilisateur = utilisateur;
    return next();
  } catch (erreur) {
    return res.status(401).json({ erreur: "Token JWT invalide ou expiré" });
  }
};
