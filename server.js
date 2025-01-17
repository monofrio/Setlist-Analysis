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


/** ************** **/
/**   GET  **/
/** ************** **/

/** Search for artists Setlist.FM */
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

/** Local Database: Fetch Artist */
app.get('/api/artists', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.id, a.name, a.mbid, u.last_update, COALESCE(c.setlist_count, 0) AS setlist_count
            FROM artists a
            LEFT JOIN setlist_updates u ON a.id = u.artist_id
            LEFT JOIN setlist_counts c ON a.id = c.artist_id
            ORDER BY a.name ASC
        `);
        res.status(200).json({ artists: result.rows });
    } catch (error) {
        console.error('Error fetching artists:', error.message);
        res.status(500).json({ error: 'Failed to fetch artists.' });
    }
});

/** Local Database: Search Setlist */
app.get('/api/artists/:artistId/setlists', async (req, res) => {
    const { artistId } = req.params;

    try {
        // Fetch setlists for the given artist ID
        const result = await pool.query('SELECT * FROM setlists WHERE artist_id = $1 ORDER BY event_date DESC;', [
            artistId,
        ]);
        res.status(200).json({ setlists: result.rows });
    } catch (error) {
        console.error('Error fetching setlists:', error.message);
        res.status(500).json({ error: 'Failed to fetch setlists for the artist.' });
    }
});

/** Local Database: Setlist Count */
app.get('/api/artists/:artistId/setlist-count', async (req, res) => {
    const { artistId } = req.params;

    if (!artistId) {
        return res.status(400).json({ error: 'Artist ID is required.' });
    }

    try {
        // Count the number of setlists for the given artist in the database
        const countResult = await pool.query(
            'SELECT COUNT(*) AS count FROM setlists WHERE artist_id = $1',
            [artistId]
        );
        const setlistCount = parseInt(countResult.rows[0].count, 10);

        // Update or insert the count into the setlist_counts table
        await pool.query(
            `
            INSERT INTO setlist_counts (artist_id, setlist_count)
            VALUES ($1, $2)
            ON CONFLICT (artist_id) DO UPDATE
            SET setlist_count = EXCLUDED.setlist_count
            `,
            [artistId, setlistCount]
        );

        // Send the count in the response
        res.status(200).json({
            message: `Setlist count updated successfully for artist ID ${artistId}.`,
            artistId,
            setlistCount,
        });
    } catch (error) {
        console.error('Error fetching or updating setlist count:', error.message);
        res.status(500).json({ error: 'Failed to fetch or update setlist count.' });
    }
});

/** Check Setlist */
app.get('/api/artists/:mbid/check-setlists', async (req, res) => {
    const { mbid } = req.params;

    if (!mbid) {
        return res.status(400).json({ error: 'Artist MBID is required.' });
    }

    try {
        // Check if the artist exists in the database
        const artistResult = await pool.query('SELECT id FROM artists WHERE mbid = $1', [mbid]);
        const artistId = artistResult.rows[0]?.id;

        if (!artistId) {
            return res.status(404).json({ error: `Artist with MBID ${mbid} not found.` });
        }

        // Get total setlists in the database
        const dbSetlistCountResult = await pool.query(
            'SELECT COUNT(*) AS count FROM setlists WHERE artist_id = $1',
            [artistId]
        );
        const dbSetlistCount = parseInt(dbSetlistCountResult.rows[0].count, 10);

        // Fetch total setlists from Setlist.FM
        const response = await axios.get(`https://api.setlist.fm/rest/1.0/artist/${mbid}/setlists`, {
            headers: {
                Accept: 'application/json',
                'x-api-key': process.env.SETLISTFM_API_KEY,
            },
        });

        const totalSetlistsFm = response.data.total || 0;

        // Return comparison data
        return res.status(200).json({
            message: 'Setlist comparison completed.',
            dbSetlistCount,
            totalSetlistsFm,
        });
    } catch (error) {
        console.error('Error checking setlists:', error.message);
        res.status(500).json({ error: 'Failed to check setlists.' });
    }
});

/** Testing Setlist connection */
app.get('/api/setlistfm/:mbid/setlists', async (req, res) => {
    const { mbid } = req.params;
    const { page = 1 } = req.query; // Default to page 1 if not provided

    if (!mbid) {
        return res.status(400).json({ error: 'Artist MBID is required.' });
    }

    try {
        const response = await axios.get(`https://api.setlist.fm/rest/1.0/artist/${mbid}/setlists`, {
            headers: {
                Accept: 'application/json',
                'x-api-key': process.env.SETLISTFM_API_KEY,
            },
            params: { p: page },
        });

        const setlists = response.data.setlist || [];
        const totalSetlists = response.data.total || 0;

        res.status(200).json({ setlists, totalSetlists });
    } catch (error) {
        console.error('Error fetching setlists from Setlist.FM:', error.message);
        res.status(500).json({ error: 'Failed to fetch setlists from Setlist.FM.' });
    }
});

app.get('/api/setlistfm/artists', async (req, res) => {
    const { artistName } = req.query;

    try {
        const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/artists`, {
            headers: {
                Accept: 'application/json',
                'x-api-key': process.env.SETLISTFM_API_KEY,
            },
            params: { artistName, sort: 'relevance' },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching artists from Setlist.FM:', error.message);
        res.status(500).json({ error: 'Failed to fetch artists from Setlist.FM.' });
    }
});


app.get('/api/setlists/:setlistId/exists', async (req, res) => {
    const { setlistId } = req.params;

    try {
        const result = await pool.query('SELECT 1 FROM setlists WHERE setlist_id = $1', [setlistId]);

        if (result.rowCount > 0) {
            return res.status(200).json(true); // Setlist exists
        }

        return res.status(200).json(false); // Setlist does not exist
    } catch (error) {
        console.error('Error checking setlist existence:', error.message);
        res.status(500).json({ error: 'Failed to check setlist existence.' });
    }
});


/** ************** **/
/**   POST  **/
/** ************** **/
app.post('/api/artists', async (req, res) => {
    const { name, mbid } = req.body;

    if (!name || !mbid) {
        return res.status(400).json({ error: 'Name and MBID are required.' });
    }

    try {
        await pool.query(
            `INSERT INTO artists (name, mbid) VALUES ($1, $2) ON CONFLICT (mbid) DO NOTHING`,
            [name, mbid]
        );

        res.status(201).json({ message: 'Artist added successfully.' });
    } catch (error) {
        console.error('Error adding artist:', error.message);
        res.status(500).json({ error: 'Failed to add artist.' });
    }
});

app.post('/api/setlists', async (req, res) => {
    const { artistId, setlistId, eventDate, venueName, cityName, setlistData } = req.body;

    try {
        await pool.query(
            `INSERT INTO setlists (artist_id, setlist_id, event_date, venue_name, city_name, setlist_data)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (setlist_id) DO NOTHING`,
            [artistId, setlistId, eventDate, venueName, cityName, setlistData]
        );

        res.status(201).json({ message: 'Setlist added successfully.' });
    } catch (error) {
        console.error('Error adding setlist:', error.message);
        res.status(500).json({ error: 'Failed to add setlist.' });
    }
});


// Add Cons Job Back in

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
