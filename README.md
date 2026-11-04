# API Taverne — Backend Express

API du TP « Tableau de bord du Maître du Jeu », séparée du frontend [registre-taverne-frontend](https://github.com/youssou18drame-crypto/registre-taverne-frontend).

## Installation locale

```bash
npm install
```

Créer à la racine un fichier `.env` **non versionné**, en suivant `.env.example` :

```env
PORT=3000
DATABASE_URL=VOTRE_URL_POSTGRESQL
JWT_SECRET=UNE_VALEUR_LONGUE_ET_ALEATOIRE
FRONTEND_ORIGIN=http://localhost:3001
```

Conserver les valeurs de l'ancien projet `api-taverne/.env` local ; **ne jamais copier le contenu du .env dans GitHub ou dans un message public**. Utiliser une valeur `JWT_SECRET` suffisamment longue et aléatoire.

Puis :

```bash
npm start
```

API : http://localhost:3000.

## Tables PostgreSQL attendues

Le backend utilise les tables existantes du TP précédent :

- `utilisateur` : colonnes `id`, `email`, `mot_de_passe` (hash bcrypt).
- `personnage` : colonnes `id`, `nom`, `classe`, `niveau`.

Le schéma doit déjà exister sur le PostgreSQL/Neon utilisé en cours. Aucune migration n'est exécutée automatiquement.

## Routes

| Méthode | Route | Authentification | Action |
| --- | --- | --- | --- |
| POST | /api/login | Publique | Vérifie email/password, renvoie un JWT valable 1 h |
| GET | /api/pnj | JWT | Liste des PNJ |
| GET | /api/pnj/:id | JWT | Détail d'un PNJ |
| POST | /api/pnj | JWT | Insère un PNJ en PostgreSQL |
| DELETE | /api/pnj/:id | JWT | Simulation uniquement, **ne supprime rien** |

Les routes protégées attendent `Authorization: Bearer <token>`.

### Tester le refus sans JWT

```bash
curl -i http://localhost:3000/api/pnj
```

Résultat attendu : HTTP **401**. C'est volontaire ; pour récupérer les PNJ, se connecter via le frontend sur le port 3001.

## Notes de sécurité

Ne pas publier `.env`, ni `DATABASE_URL`, ni `JWT_SECRET`, ni des mots de passe. La configuration CORS autorise uniquement le frontend local par défaut, avec une origine personnalisable par `FRONTEND_ORIGIN`. Les paramètres SQL sont passés séparément à `pool.query`.

## Ce qui reste à vérifier sur le poste de travail

- Connexion au PostgreSQL existant.
- Existence d'un compte `utilisateur` avec mot de passe bcrypt.
- Connexion depuis le frontend, affichage des PNJ, ajout d'un PNJ et conservation après F5.
- Refus HTTP 401 en absence de token ou avec un token expiré.
