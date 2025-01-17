import React, { useState } from 'react';
import axiosInstance from './axiosInstance';
import SetlistViewer from "./SetlistViewer";

const ArtistList = ({ artists, onRefresh }) => {
    const [selectedMbid, setSelectedMbid] = useState(null); // State to track the selected artist's MBID
    const [isAdding, setIsAdding] = useState(false);
    const [totoalSetlist, setTotlalSetlist] = useState(null)
    const handleSelectArtist = (artist) => {
        setSelectedMbid(artist.mbid); // Update selected MBID
    };

    const handleUpdateSetlistCount = async (artist) => {
        try {
            const response = await axiosInstance.get(`/api/artists/${artist.id}/setlist-count`);
            alert(`Setlist count for ${artist.name} updated to ${response.data.setlistCount}.`);
            onRefresh(); // Refresh the artist list
        } catch (err) {
            console.error('Error updating setlist count:', err.message);
            alert('Failed to update setlist count.');
        }
    };

    const handleAddSetlistsToDatabase = async (artist) => {
        setIsAdding(true);
        try {
            let currentPage = 1;
            let totalSetlistsFetched = 0;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await axiosInstance.get(`/api/setlistfm/${artist.mbid}/setlists`, {
                    params: { page: currentPage },
                });

                const setlists = response.data.setlists || [];
                const totalPages = Math.ceil(response.data.totalSetlists / 20); // Assuming 20 setlists per page

                for (const setlist of setlists) {
                    // Check if the setlist already exists in the database
                    const { data: exists } = await axiosInstance.get(`/api/setlists/${setlist.id}/exists`);

                    if (exists) {
                        console.log(`Setlist ${setlist.id} already exists. Skipping.`);
                        continue;
                    }

                    // Convert date from DD-MM-YYYY to YYYY-MM-DD
                    const rawDate = setlist.eventDate; // Example: "31-12-2024"
                    const [day, month, year] = rawDate.split('-');
                    const formattedDate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD

                    // Add the setlist to the database
                    try {
                        await axiosInstance.post(`/api/setlists`, {
                            artistId: artist.id,
                            setlistId: setlist.id,
                            eventDate: formattedDate,
                            venueName: setlist.venue?.name || null,
                            cityName: setlist.city?.name || null,
                            setlistData: setlist.sets || {},
                        });
                        console.log(`Setlist ${setlist.id} added to the database.`);
                    } catch (err) {
                        console.error(`Error adding setlist ${setlist.id}:`, err.message);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 100)); // 2-second delay

                }

                totalSetlistsFetched += setlists.length;
                currentPage++;
                hasMorePages = currentPage <= totalPages;
            }

            alert(`Added ${totalSetlistsFetched} setlists for ${artist.name} to the database.`);
        } catch (err) {
            console.error('Error fetching setlists:', err.message);
            alert('Failed to fetch setlists for adding to the database.');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div>
            <h2>Stored Artists</h2>
            <table border="1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Last Update</th>
                    <th>Setlist Count in DB</th>
                    <th>Update Count</th>
                    <th>Actions</th>
                    <th>Add Setlists</th>
                </tr>
                </thead>
                <tbody>
                {artists.map((artist) => (
             
                    <tr key={artist.id}>
                        <td>{artist.id}</td>
                        <td>{artist.name}</td>
                        <td>{artist.last_update ? new Date(artist.last_update).toLocaleString() : 'Never'}</td>
                        <td>{artist.setlist_count ? artist.setlist_count : "No Data"}</td>
                        <td>
                            <button onClick={() => handleUpdateSetlistCount(artist)}>Update Count</button>
                        </td>
                        <td>
                            <button onClick={() => handleSelectArtist(artist)}>Fetch Setlists</button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleAddSetlistsToDatabase(artist)}
                                disabled={isAdding}
                            >
                                {isAdding ? 'Adding Setlists...' : 'Add Setlists to DB'}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


            {/** Display the SetlistViewer only when an artist is selected */}
            {selectedMbid && (
                <div>
                    <h2>Setlists for Selected Artist</h2>
                    <SetlistViewer mbid={selectedMbid} />
                </div>
            )}
        </div>
    );
};

export default ArtistList;
