require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db/index'); // Database connection

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Search for artists
app.get('/api/artists/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const response = await axios.get('https://api.setlist.fm/rest/1.0/search/artists', {
            headers: {
                Accept: 'application/json',
                'x-api-key': process.env.SETLISTFM_API_KEY,
            },
            params: { artistName: query, p: 1, sort: 'relevance' },
        });

        res.status(200).json({ artists: response.data.artist || [] });
    } catch (error) {
        console.error('Error fetching artists:', error.message);
        res.status(500).json({ error: 'Failed to fetch artists.' });
    }
});

// Add artist to database
app.post('/api/artists', async (req, res) => {
    const { artistName } = req.body;

    if (!artistName) {
        return res.status(400).json({ error: 'Artist name is required.' });
    }

    try {
        // Fetch artist details
        const response = await axios.get('https://api.setlist.fm/rest/1.0/search/artists', {
            headers: {
                Accept: 'application/json',
                'x-api-key': process.env.SETLISTFM_API_KEY,
            },
            params: { artistName, p: 1, sort: 'relevance' },
        });

        const artist = response.data.artist[0]; // Use the first match
        if (!artist) {
            return res.status(404).json({ error: `No artist found with name "${artistName}".` });
        }

        // Insert into database
        const result = await pool.query(
            `INSERT INTO artists (name, mbid, disambiguation, url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (mbid) DO NOTHING
             RETURNING id`,
            [artist.name, artist.mbid, artist.disambiguation, artist.url]
        );

        const artistId = result.rows[0]?.id;
        res.status(201).json({ message: `Artist "${artist.name}" added successfully.`, artistId });
    } catch (error) {
        console.error('Error adding artist:', error.message);
        res.status(500).json({ error: 'Failed to add artist.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
