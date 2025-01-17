import React from 'react';

const SetlistDisplay = ({ setlists }) => {
    return (
        <div>
            <h2>Fetched Setlists</h2>
            {setlists.length > 0 ? (
                <ul>
                    {setlists.map((setlist) => (
                        <li key={setlist.id}>
                            <strong>{setlist.eventDate}</strong> - {setlist.venue?.name || 'Unknown Venue'}, {setlist.city?.name || 'Unknown City'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No setlists found.</p>
            )}
        </div>
    );
};

export default SetlistDisplay;
