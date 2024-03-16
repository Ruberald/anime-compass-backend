import express from 'express';
import fs from 'node:fs';
import https from 'https';
// import queryString from 'querystring';

export const app = express();

const client_id = fs.readFileSync('src/.env').toString().trim();

app.get('/', (_req, res) => {
    res.send('<b>Hello World!</b>');
})

app.get('/hey/:user', (_req, res) => {
    const user = _req.params.user;
    res.send("Hey " + user);
})

app.get('/details/:user', async (req, res) => {
    try {
        // const queryParams = queryString.stringify({
        //     fields: `list_status,genre`,
        //     limit: 4,
        //     status: 'completed',
        //     sort: 'list_score'
        // });
        const user = req.params.user;
        const options = {
            hostname: 'api.myanimelist.net',
            path: `/v2/users/${user}/animelist?fields=list_status,genres&limit=4&status=completed&sort=list_score`,
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
                res.json(JSON.parse(data));
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
// module.exports = app;

