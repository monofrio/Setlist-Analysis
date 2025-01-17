import React, { useState } from 'react';
import SetlistViewer from './SetlistViewer';

const ArtistSetlistViewer = ({ artists }) => {
    const [selectedArtist, setSelectedArtist] = useState(null);

    return (
        <div>
            <h1>Artists</h1>
            <ul>
                {artists.map((artist) => (
                    <li key={artist.mbid}>
                        {artist.name}{' '}
                        <button onClick={() => setSelectedArtist(artist)}>Fetch Setlists</button>
                    </li>
                ))}
            </ul>

            {selectedArtist && (
                <div>
                    <h2>Setlists for {selectedArtist.name}</h2>
                    <SetlistViewer mbid={selectedArtist.mbid} />
                </div>
            )}
        </div>
    );
};

export default ArtistSetlistViewer;
