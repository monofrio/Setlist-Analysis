require('dotenv').config();
const axios = require('axios');

// Load environment variables
const SPOTIFY_API_URL = process.env.SPOTIFY_API_URL;
const SPOTIFY_TOKEN_URL = process.env.SPOTIFY_TOKEN_URL;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Function to get Spotify access token
async function getSpotifyAccessToken() {
    try {
        const response = await axios.post(
            SPOTIFY_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'client_credentials',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Spotify access token:', error.response?.data || error.message);
        throw error;
    }
}

// Function to search for an artist by name
async function searchArtistByName(artistName) {
    try {
        const token = await getSpotifyAccessToken();

        const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                q: artistName,
                type: 'artist',
                limit: 1, // Fetch only the most relevant result
            },
        });

        if (response.data.artists.items.length > 0) {
            // console.log(response.data.artists.items[0])
            return response.data.artists.items[0]; // Return the first artist object
        } else {
            console.log('No artist found for the given name.');
            return null;
        }
    } catch (error) {
        console.error('Error searching for artist:', error.response?.data || error.message);
        throw error;
    }
}

// Function to fetch related artists
async function getRelatedArtists(artistId) {
    try {
        const token = await getSpotifyAccessToken();

        const response = await axios.get(`${SPOTIFY_API_URL}/artists/${artistId}/related-artists`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(response.data.artists)
        return response.data.artists; // Return the list of related artists
    } catch (error) {
        if (error.response?.status === 404) {
            console.error(`No related artists found for artist ID: ${artistId}`);
            return []; // Return an empty array
        } else {
            console.error('Error fetching related artists:', error.response?.data || error.message);
            throw error;
        }
    }
}

// Main function to search for related artists by name
async function searchRelatedArtists(artistName) {
    try {
        // Step 1: Search for the artist by name
        const artist = await searchArtistByName(artistName);

        if (!artist) {
            console.log('Artist not found.');
            return;
        }
        console.log(artist)
        console.log(`Found artist: ${artist.name} (ID: ${artist.id})`);

        // Step 2: Fetch related artists
        const relatedArtists = await getRelatedArtists(artist.id);

        if (relatedArtists.length === 0) {
            console.log(`No related artists found for ${artist.name}.`);
        } else {
            console.log(`Related artists to ${artist.name}:`);
            relatedArtists.forEach((relatedArtist) => {
                console.log(`- ${relatedArtist.name}`);
            });
        }
    } catch (error) {
        console.error('Error in searchRelatedArtists:', error.message);
    }
}

// Example usage
searchRelatedArtists('Coldplay');
