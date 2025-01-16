const pool = require('./index');

const createTables = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mbid VARCHAR(255) UNIQUE,
        disambiguation TEXT,
        url TEXT
      );
    `);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS setlists (
        id SERIAL PRIMARY KEY,
        artist_id INT REFERENCES artists(id),
        event_date DATE NOT NULL,
        setlist_data JSONB,
        UNIQUE(artist_id, event_date)
      );
    `);

        console.log('Tables created successfully!');
    } catch (err) {
        console.error('Error creating tables:', err.message);
    } finally {
        pool.end();
    }
};

createTables();
