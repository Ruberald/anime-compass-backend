import express from 'express';
import https from 'https';
import dotenv from 'dotenv';

export const app = express();
dotenv.config();

const client_id = process.env.client_id;
app.get('/', (_req, res) => {
    res.send('Hello World!');
})

app.get('/hey/:user', (_req, res) => {
    const user = _req.params.user;
    res.send("Hey " + user);
})

app.get('/details/:user', async (req, res) => {
    try {
        const user = req.params.user;
        const options = {
            hostname: 'api.myanimelist.net',
            path: `/v2/users/${user}/animelist?fields=list_status,genres&limit=1000&status=completed&sort=list_score`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-MAL-CLIENT-ID': client_id
            }
        };

        const reqApi = https.request(options, (responseFromApi) => {
            let data = '';

            responseFromApi.on('data', (chunk) => {
                data += chunk;
            });

            responseFromApi.on('end', () => {
                const jsonResponse = JSON.parse(data);
                const genreScoreMap = {};

                jsonResponse.data.forEach(animeEntry => {
                    const animeGenres = animeEntry.node.genres;
                    const animeScore = animeEntry.list_status.score;

                    animeGenres.forEach(genre => {
                        const genreName = genre.name;
                        if (genreScoreMap[genreName]) {
                            genreScoreMap[genreName] += animeScore;
                        } else {
                            genreScoreMap[genreName] = animeScore;
                        }
                    });
                });

                res.json(genreScoreMap);
            });
        });

        reqApi.on('error', (error) => {
            console.error('Error fetching anime:', error);
            res.status(500).json({ error: 'Failed to fetch anime information' });
        });

        reqApi.end();
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime information' });
    }
});
