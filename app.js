const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const validator = require('validator');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parse')
const app = express();
const port = 3000;

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ajoute le mot de passe si nécessaire
  database: 'shorten',
});


// Middleware pour parser le corps des requêtes en JSON et en URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route GET / (Page d'accueil)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'home.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'about.html'));
});

app.get('/myurls', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'myurls.html'));
});

app.get('/qrcode', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'qrcode.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'report.html'));
});

// Route POST /shorten pour ajouter un lien à la base de données
app.post('/shorten', (req, res) => {
  let destinationUrl = req.body.url;

  // Validation de l'URL
  if (!validator.isURL(destinationUrl)) {
    return res.status(400).send('URL invalide');
  }

  // Nettoyage de l'URL : retirer le http://, https:// et www.
  destinationUrl = destinationUrl.replace(/^https?:\/\//, '').replace(/^http?:\/\//, '').replace(/^www\./, '').toLowerCase();

  // Vérifier si l'URL existe déjà dans la base de données
  db.query('SELECT * FROM links WHERE destination_url = ?', [destinationUrl], (err, result) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }

    if (result.length > 0) {
      // L'URL existe déjà, renvoyer l'ID court existant
      return res.send(`localhost:3000/${result[0].short_id}`);
    } else {
      // Générer un short_id unique pour l'URL
      const shortId = generateShortId();

      // Insérer le lien dans la base de données
      db.query('INSERT INTO links (short_id, destination_url) VALUES (?, ?)', [shortId, destinationUrl], (err, result) => {
        if (err) {
          return res.status(500).send('Erreur serveur');
        }

        // Retourner l'URL raccourcie
        res.send(`localhost:3000/${shortId}`);
      });
    }
  });
});

// Route GET /:shortId pour rediriger vers l'URL d'origine
app.get('/:shortId', (req, res) => {
  const shortId = req.params.shortId;

  db.query('SELECT * FROM links WHERE short_id = ?', [shortId], (err, result) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }

    if (result.length > 0) {
      // URL trouvée, rediriger directement vers l'URL d'origine
      res.redirect(301, "https://" + result[0].destination_url);
    } else {
      res.status(404).send('URL raccourcie introuvable');
    }
  });
});

app.post('/upload', (req, res) => {
  const file = req.files
});

// app.post('/api/bulk', (req, res))
//
// var csvData=[];
// fs.createReadStream(req.file.path)
//     .pipe(parse({delimiter: ':'}))
//     .on('data', function(csvrow) {
//       console.log(csvrow);
//       //do something with csvrow
//       csvData.push(csvrow);
//     })
//     .on('end',function() {
//       //do something with csvData
//       console.log(csvData);
//     });

// app.post('api/qrcode')

// Fonction pour générer un short_id unique
const generateShortId = () => crypto.randomBytes(3).toString('hex');

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur http://localhost:${port}`);
});
