require('dotenv').config();
const pool = require('../db/index'); // Database connection

/**
 * Analyze sequences of a specific length for an artist's setlists, optionally filtered by year.
 * @param {number} artistId - The artist's ID in the database.
 * @param {number} length - The length of the sequences (e.g., 5 songs).
 * @param {number} [year] - The year to filter the setlists (optional).
 * @returns {Object} - An object containing the sequences and their total occurrences.
 */
const analyzeSequences = async (artistId, length = 5, year = null) => {
    try {
        let query = 'SELECT setlist_data FROM setlists WHERE artist_id = $1';
        const params = [artistId];

        // If a year is provided, add a filter for the event_date
        if (year) {
            query += ' AND EXTRACT(YEAR FROM event_date) = $2';
            params.push(year);
        }

        const result = await pool.query(query, params);
        const setlists = result.rows.map((row) => row.setlist_data);

        const sequenceFrequency = {};

        setlists.forEach((setlist) => {
            // Extract all songs from the setlist
            const songs = extractSongsFromSetlist(setlist);

            // Generate sequences (n-grams) of the specified length
            const sequences = generateNGrams(songs, length);

            // Track frequency of each sequence
            sequences.forEach((sequence) => {
                const key = sequence.join(' -> '); // Create a string key for the sequence
                sequenceFrequency[key] = (sequenceFrequency[key] || 0) + 1;
            });
        });

        // Filter for sequences that occur more than once
        const consistentSequences = Object.entries(sequenceFrequency)
            .filter(([sequence, count]) => count > 1) // Only include sequences with count > 1
            .sort((a, b) => b[1] - a[1]) // Sort by frequency
            .map(([sequence, count]) => [sequence, count]); // Format as [sequence, count]

        // Calculate the total occurrences of all consistent sequences
        const totalOccurrences = consistentSequences.reduce((sum, [, count]) => sum + count, 0);

        console.log(`Consistent Sequences of length ${length} (occurring more than once):`);
        consistentSequences.forEach(([sequence, count]) => {
            console.log(`[ '${sequence}', ${count} ]`);
        });

        console.log(`Total Occurrences of Consistent Sequences: ${totalOccurrences}`);

        return { consistentSequences, totalOccurrences };
    } catch (error) {
        console.error('Error analyzing sequences:', error.message);
    } finally {
        await pool.end(); // Close the database connection
    }
};

// Extract all songs from a setlist
const extractSongsFromSetlist = (setlist) => {
    const songs = [];

    if (setlist.set && Array.isArray(setlist.set)) {
        setlist.set.forEach((set) => {
            if (set.song && Array.isArray(set.song)) {
                set.song.forEach((song) => {
                    if (song && song.name) {
                        songs.push(song.name.trim());
                    }
                });
            }
        });
    }

    return songs;
};

// Generate n-grams (sequences of `n` consecutive songs)
const generateNGrams = (songs, n) => {
    const nGrams = [];
    for (let i = 0; i <= songs.length - n; i++) {
        nGrams.push(songs.slice(i, i + n)); // Extract `n` consecutive songs
    }
    return nGrams;
};

// Replace with the artist's ID, desired sequence length, and optional year
const artistId = 6; // Replace with your artist ID
const sequenceLength = 5; // Analyze sequences of 5 songs
const filterYear = 2024; // Replace with your desired year (or null to fetch all years)
analyzeSequences(artistId, sequenceLength, filterYear);
