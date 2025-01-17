const pool = require('./index');

const createTables = async () => {
    try {
        // Create the `setlists` table
        await pool.query(`
    CREATE TABLE IF NOT EXISTS setlists (
        id SERIAL PRIMARY KEY,
        artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
        setlist_id VARCHAR(255) UNIQUE NOT NULL,
        event_date DATE NOT NULL,
        venue_name TEXT,
        city_name TEXT,
        setlist_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (artist_id, event_date)
    );
    `);

        // Create the `setlist_counts` table
        await pool.query(`
    CREATE TABLE IF NOT EXISTS setlist_counts (
        artist_id INT PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
        setlist_count INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

        // Create the `song_sequences` table
        await pool.query(`
    CREATE TABLE IF NOT EXISTS song_sequences (
        id SERIAL PRIMARY KEY,
        artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
        sequence TEXT NOT NULL,
        length INT NOT NULL,
        count INT DEFAULT 1,
        year INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (artist_id, sequence, length, year)
    );
    `);

        // Create the `sequence_analysis` table
        await pool.query(`
    CREATE TABLE IF NOT EXISTS sequence_analysis (
        id SERIAL PRIMARY KEY,
        artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sequence_length INT NOT NULL,
        total_sequences INT DEFAULT 0,
        consistent_sequences INT DEFAULT 0,
        total_occurrences INT DEFAULT 0,
        year INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

        // Create indexes for optimization
        await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_setlists_artist_id ON setlists (artist_id);
    CREATE INDEX IF NOT EXISTS idx_setlists_event_date ON setlists (event_date);
    CREATE INDEX IF NOT EXISTS idx_song_sequences_artist_id ON song_sequences (artist_id);
    CREATE INDEX IF NOT EXISTS idx_song_sequences_year ON song_sequences (year);
    CREATE INDEX IF NOT EXISTS idx_sequence_analysis_artist_id ON sequence_analysis (artist_id);
    `);

        console.log('Tables created successfully!');
    } catch (err) {
        console.error('Error creating tables:', err.message);
    } finally {
        pool.end();
    }
};

createTables();
