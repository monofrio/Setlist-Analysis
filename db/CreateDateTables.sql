-- Table to store artists
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mbid VARCHAR(255) UNIQUE NOT NULL, -- MusicBrainz ID
    disambiguation TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table to store setlists
CREATE TABLE setlists (
    id SERIAL PRIMARY KEY,
    artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    setlist_id VARCHAR(255) UNIQUE NOT NULL, -- Unique ID from Setlist.fm
    event_date DATE NOT NULL,
    venue_name TEXT,
    city_name TEXT,
    setlist_data JSONB, -- Raw JSON data from Setlist.fm API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (artist_id, event_date)
);

-- Table to track the number of setlists for each artist
CREATE TABLE setlist_counts (
    artist_id INT PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
    setlist_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store song sequences
CREATE TABLE song_sequences (
    id SERIAL PRIMARY KEY,
    artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    sequence TEXT NOT NULL, -- Song sequence as a single string (e.g., "A -> B -> C")
    length INT NOT NULL, -- Length of the sequence
    count INT DEFAULT 1, -- Frequency of the sequence
    year INT, -- Optional: Year the sequence was found
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (artist_id, sequence, length, year) -- Prevent duplicate entries
);

-- Table to track the analysis process
CREATE TABLE sequence_analysis (
    id SERIAL PRIMARY KEY,
    artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the analysis was performed
    sequence_length INT NOT NULL, -- Length of the sequences analyzed (e.g., 5)
    total_sequences INT DEFAULT 0, -- Total number of sequences analyzed
    consistent_sequences INT DEFAULT 0, -- Number of consistent sequences found (count > 1)
    total_occurrences INT DEFAULT 0, -- Total occurrences of consistent sequences
    year INT, -- Optional: Year filter used for the analysis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_setlists_artist_id ON setlists (artist_id);
CREATE INDEX idx_setlists_event_date ON setlists (event_date);
CREATE INDEX idx_song_sequences_artist_id ON song_sequences (artist_id);
CREATE INDEX idx_song_sequences_year ON song_sequences (year);
CREATE INDEX idx_sequence_analysis_artist_id ON sequence_analysis (artist_id);
