const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testBulkUpload() {
    const filePath = 'test.csv';

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
        console.error("Le fichier CSV de test n'existe pas.");
        return;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    try {
        const response = await axios.post('http://localhost:3000/api/bulk', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Réponse du serveur:', response.data);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du fichier:', error.response ? error.response.data : error.message);
    }
}

testBulkUpload();
