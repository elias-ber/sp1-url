const axios = require('axios');

// Remplacez ces valeurs par celles que vous souhaitez tester
const url = 'https://www.example.com';
const alias = 'exmpl';
const tracked = 1;
const expires_at = Math.floor(Date.now() / 1000) + 3600; // expire dans 1 heure

const testShorten = async () => {
    try {
        const response = await axios.post(`http://localhost:3000/api/shorten/${url}/${alias}/${tracked}/${expires_at}`);
        console.log('Réponse :', response.data);
    } catch (error) {
        console.error('Erreur :', error.response ? error.response.data : error.message);
    }
};

testShorten();
