# ✂️ Raccourcisseur URL

Un raccourcisseur d'URL simple permettant de transformer des URLs longues en versions plus courtes et plus faciles à partager.

## 🛠️ Stack (outils utilisés)

### 🎨 Frontend
- **Mustache.js** : Utilisé pour construire l'interface utilisateur.
- **Axios** : Pour gérer les requêtes HTTP vers le backend.
- **CSS** : Pour le style de l'application.

### ⚙️ Backend
- **Node.js** : Environnement d'exécution pour le backend.
- **Express.js** : Framework pour gérer les routes et les requêtes HTTP.
- **MySQL** : Base de données relationnelle pour stocker les URLs raccourcies.
- **dotenv** : Gestion des variables d'environnement.
- **node-localstorage** : Stockage local temporaire des données.
- **validator** : Validation des entrées utilisateur.

#### 📦 Librairies utilisées :
- `axios`
- `body-parser`
- `csv-parse`
- `dotenv`
- `easyqrcodejs-nodejs`
- `express`
- `fs`
- `mustache-express`
- `mysql2`
- `node-localstorage`
- `nodemon`
- `validator`

## ✨ Fonctionnalités
- 🔗 **Raccourcissement d'URL** : Permet de convertir une URL longue en une version courte.
- 🔄 **Redirection** : Lorsqu'un utilisateur accède à une URL raccourcie, il est redirigé vers l'URL d'origine.
- 📊 **Suivi des clics** : Enregistrement du nombre de clics pour chaque URL raccourcie.
- ⏳ **Expiration des liens** : Les liens raccourcis peuvent avoir une date d'expiration configurable.
- 🏷️ **Personnalisation de l'URL** : L'utilisateur peut choisir une partie de l'URL raccourcie (si elle est disponible).
- 📲 **Génération de QR Code** : Création d'un QR code pour chaque URL raccourcie (via `easyqrcodejs-nodejs`).
- 📂 **Importation CSV** : Possibilité d'importer plusieurs URLs depuis un fichier CSV.
- 🔐 **Protection par mot de passe** : Option pour protéger une URL raccourcie avec un mot de passe.
- 💾 **Sauvegarde des liens raccourcis** : Permet de sauvegarder et de suivre les liens raccourcis via le localStorage afin de garder en mémoire nos lien créés

## 🌍 Routes Express

### 🏠 Application

| METHOD | Routes            | Description                                        |
|--------|-------------------|----------------------------------------------------|
| POST   | `/shorten`         | Crée une URL raccourcie à partir d'une URL longue. |
| GET    | `/stats/:shortId`  | Affiche les statistiques d'une URL raccourcie. |
| GET    | `/r/:shortId`      | Redirige l'utilisateur vers l'URL d'origine.   |
| POST   | `/verify/:shortId` | Vérifie le mot de passe avant la redirection.  |
| DELETE | `/delete/:shortId` | Supprime une URL raccourcie et ses données associées. |

### 📡 API

| METHOD | Routes           | Description                                        |
|--------|------------------|----------------------------------------------------|
| POST   | `/api/shorten`    | Endpoint API pour raccourcir une URL.         |
| GET    | `/api/stats/:id`  | Retourne les statistiques d'une URL raccourcie. |
| GET    | `/api/r/:shortId` | Redirige l'utilisateur vers l'URL d'origine.  |
| POST   | `/api/verify/:shortId` | Vérifie le mot de passe avant la redirection. |

## ⚡ Installation

### 🔧 Prérequis
- **Node.js** installé
- **MySQL** installé et configuré

### 📥 Cloner le projet
```bash
git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo
```

📦 Installer les dépendances

Copier le code
```bash
npm install
```

⚙️ Configurer l'environnement
Créer un fichier .env à la racine du projet et ajouter :

```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=url_shortener
```
🚀 Lancer le serveur
```bash
npm start
```
Ou avec Nodemon (pour le développement) :
```bash
npm run dev
```