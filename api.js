const express = require('express');
const mysql = require('mysql2');
const validator = require('validator');
const { localStorage } = require('node-localstorage');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });


const app = express();
const port = 3000;

app.use(express.json());

// Configuration de la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shorten'
});

// Connexion à la base de données
db.connect(err => {
    if (err) throw err;
    console.log('Connexion à la base de données réussie.');
});

// Création d'un lien raccourci
app.post('/api/shorten/:url/:alias/:tracked/:lifetime/:password', (req, res) => {
    let { url, alias, tracked, lifetime, password } = req.params;

    // Validation de l'URL
    if (!validator.isURL(url)) {
        return res.status(400).send('URL invalide');
    }

    // Nettoyage de l'URL : retirer le http://, https:// et www.
    url = url.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();

    // Validation de l'alias (max 32 caractères)
    if (alias.length > 32) {
        return res.status(400).send("L'alias ne doit pas dépasser 32 caractères.");
    }

    // Validation de tracked (doit être 0 ou 1)
    tracked = parseInt(tracked);
    if (isNaN(tracked) || (tracked !== 0 && tracked !== 1)) {
        return res.status(400).send("Le paramètre 'tracked' doit être 0 ou 1.");
    }

    // Validation et conversion de lifetime en TIMESTAMP
    lifetime = parseInt(lifetime);
    let expires_at_timestamp = null;
    if (!isNaN(lifetime) && lifetime > 0) {
        expires_at_timestamp = new Date(lifetime * 1000).toISOString().slice(0, 19).replace('T', ' ');
    }

    // Vérifier si l'URL existe déjà en base de données
    db.query('SELECT * FROM links WHERE destination_url = ?', [url], (err, result) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }

        if (result.length > 0) {
            const existingLink = result[0];

            // Vérifier si l'URL a les attributs `is_custom: 0`, `is_tracked: 0`, `lifetime: NULL`
            if (existingLink.is_custom === 0 && existingLink.is_tracked === 0 && existingLink.lifetime === null) {
                return res.send(`localhost:3000/${existingLink.short_id}`);
            }
        }

        // Vérifier si l'alias existe déjà
        db.query('SELECT * FROM links WHERE short_id = ?', [alias], (err, result) => {
            if (err) {
                return res.status(500).send('Erreur serveur');
            }

            if (result.length > 0) {
                return res.status(400).send("Cet alias est déjà utilisé.");
            }

            // Insérer le lien dans la base de données
            db.query(
                'INSERT INTO links (short_id, destination_url, is_custom, is_tracked, expired_at) VALUES (?, ?, ?, ?, ?)',
                [alias, url, 1, tracked, expires_at_timestamp],
                (err, result) => {
                    if (err) {
                        return res.status(500).send('Erreur serveur');
                    }
                    res.send(`localhost:3000/${alias}`);
                }
            );
        });
    });
});



app.post('/api/bulk', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier fourni.');
    }

    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // Vérification des colonnes requises
            const { url, alias, lifetime, tracked, password } = row;

            if (!url || !alias || tracked === undefined) {
                console.warn('Ligne ignorée : colonnes requises manquantes.', row);
                return;
            }

            results.push({ url, alias, lifetime, tracked, password });
        })
        .on('end', async () => {
            fs.unlinkSync(filePath); // Supprime le fichier après traitement

            const promises = results.map(data => {
                return fetch(`http://localhost:3000/api/shorten/${encodeURIComponent(data.url)}/${encodeURIComponent(data.alias)}/${encodeURIComponent(data.tracked)}/${encodeURIComponent(data.lifetime || 0)}/${encodeURIComponent(data.password || '')}`, {
                    method: 'POST',
                })
                    .then(response => response.text())
                    .catch(err => `Erreur pour ${data.alias}: ${err.message}`);
            });

            const responses = await Promise.all(promises);
            res.json({ results: responses });
        });
});



app.get('/:alias', (req, res) => {
    const { alias } = req.params;
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Inconnu';
    const language = req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'Inconnu';
    const referer = req.headers['referer'] || 'Direct';

    // Détection du color scheme
    const colorScheme = req.headers['sec-ch-prefers-color-scheme'] || 'Inconnu';

    // Détection du type de device
    let deviceType = 'Desktop';
    if (/Mobi|Android/i.test(userAgent)) {
        deviceType = 'Mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'Tablet';
    }

    // Vérifier si l'alias existe
    db.query('SELECT destination_url FROM links WHERE short_id = ?', [alias], (err, result) => {
        if (err) return res.status(500).send('Erreur serveur');
        if (result.length === 0) return res.status(404).send("Lien non trouvé.");

        const destinationUrl = `http://${result[0].destination_url}`;

        // **Page complètement invisible**
        res.send(`
            <html>
            <head>
                <script>
                    window.onload = function() {
                        var resolution = window.screen.width + "x" + window.screen.height;

                        // Envoyer les données sans afficher quoi que ce soit
                        fetch("/track-click", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                alias: "${alias}",
                                ip: "${userIP}",
                                userAgent: "${userAgent}",
                                language: "${language}",
                                referer: "${referer}",
                                colorScheme: "${colorScheme}",
                                deviceType: "${deviceType}",
                                screenResolution: resolution
                            })
                        }).finally(() => {
                            // Rediriger immédiatement
                            window.location.replace("${destinationUrl}");
                        });
                    };
                </script>
            </head>
            <body style="background: transparent; margin: 0; height: 100vh;"></body>
            </html>
        `);
    });
});


// **Route pour enregistrer le clic en base de données**
app.post('/track-click', express.json(), (req, res) => {
    const { alias, ip, userAgent, language, referer, colorScheme, deviceType, screenResolution } = req.body;

    db.query(
        'INSERT INTO clicks (short_id, ip_address, user_agent, language, referer, color_scheme, device_type, screen_resolution) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [alias, ip, userAgent, language, referer, colorScheme, deviceType, screenResolution],
        (err) => {
            if (err) console.error('Erreur enregistrement des infos:', err);
        }
    );

    res.sendStatus(200);
});



// Sauvegarder un shortId dans localStorage
app.post('/save', (req, res) => {
    const { alias } = req.body;

    if (!alias) {
        return res.status(400).send("Le champ 'alias' est requis.");
    }

    // Vérifier si l'alias existe dans la base de données
    db.query('SELECT short_id FROM links WHERE short_id = ?', [alias], (err, result) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }

        if (result.length === 0) {
            return res.status(404).send("Lien non trouvé.");
        }

        // Sauvegarde du short_id dans node-localstorage
        localStorage.setItem('savedShortId', alias);
        res.send(`Short ID "${alias}" sauvegardé côté serveur !`);
    });
});

// /get-saved : Récupère le short_id stocké
app.get('/get-saved', (req, res) => {
    const savedShortId = localStorage.getItem('savedShortId');

    if (!savedShortId) {
        return res.status(404).send("Aucun short ID sauvegardé.");
    }

    res.send(`Short ID sauvegardé : ${savedShortId}`);
});

//


app.listen(port, '10.100.0.14', () => {
    console.log(`Server is running on port ${port}`);
});
