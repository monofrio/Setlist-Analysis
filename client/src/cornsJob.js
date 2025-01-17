// Schedule a daily job to fetch new setlists
const cron = require('node-cron');

// Schedule a daily job to fetch new setlists
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily setlist check...');

    try {
        // Fetch all artists and their last update timestamps
        const artistResult = await pool.query(`
            SELECT a.id, a.mbid, u.last_update
            FROM artists a
            LEFT JOIN setlist_updates u ON a.id = u.artist_id
        `);
        const artists = artistResult.rows;

        for (const artist of artists) {
            const { id: artistId, mbid, last_update } = artist;

            // Skip recently updated artists
            if (last_update && new Date() - new Date(last_update) < 24 * 60 * 60 * 1000) {
                console.log(`Skipping ${mbid}, already updated within the last 24 hours.`);
                continue;
            }

            // Fetch setlists from Setlist.FM API
            const response = await axios.get(`https://api.setlist.fm/rest/1.0/artist/${mbid}/setlists`, {
                headers: {
                    Accept: 'application/json',
                    'x-api-key': process.env.SETLISTFM_API_KEY,
                },
            });

            const setlists = response.data.setlist || [];
            for (const setlist of setlists) {
                const { id: setlistId, eventDate, venue, city, sets } = setlist;

                await pool.query(
                    `
                    INSERT INTO setlists (artist_id, setlist_id, event_date, venue_name, city_name, setlist_data)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (setlist_id) DO NOTHING
                    `,
                    [
                        artistId,
                        setlistId,
                        eventDate,
                        venue?.name || null,
                        city?.name || null,
                        sets || {},
                    ]
                );
            }

            // Update the last_update timestamp in setlist_updates
            await pool.query(
                `
                INSERT INTO setlist_updates (artist_id, last_update)
                VALUES ($1, NOW())
                ON CONFLICT (artist_id) DO UPDATE
                SET last_update = EXCLUDED.last_update
                `,
                [artistId]
            );

            console.log(`Updated setlists for artist ${mbid}.`);
        }

        console.log('Daily setlist check completed.');
    } catch (error) {
        console.error('Error in daily setlist check:', error.message);
    }
});