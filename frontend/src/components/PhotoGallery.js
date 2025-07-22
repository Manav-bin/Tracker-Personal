import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PhotoGallery.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const PhotoGallery = ({ entries }) => {
  const [photos, setPhotos] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  const datesWithEntries = entries.map(entry => entry.date).sort((a, b) => new Date(b) - new Date(a));

  useEffect(() => {
    if (datesWithEntries.length > 0 && !selectedDate) {
      setSelectedDate(datesWithEntries[0]);
    }
  }, [datesWithEntries, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      fetchPhotosForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchPhotosForDate = async (date) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/photos/${date}`);
      setPhotos(prev => ({
        ...prev,
        [date]: response.data
      }));
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos(prev => ({
        ...prev,
        [date]: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (filename) => {
    return `${API_BASE_URL}/api/photos/file/${filename}`;
  };

  const currentEntry = entries.find(entry => entry.date === selectedDate);

  return (
    <div className="photo-gallery">
      <header className="gallery-header">
        <h2>Progress Photos</h2>
        <p>Visual timeline of your transformation</p>
      </header>

      <div className="date-selector">
        <label htmlFor="date-select">Select Date:</label>
        <select 
          id="date-select"
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-select"
        >
          <option value="">Select a date</option>
          {datesWithEntries.map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && currentEntry && (
        <div className="entry-info">
          <div className="entry-stats">
            <div className="stat">
              <span className="stat-label">Weight:</span>
              <span className="stat-value">{currentEntry.weight} kg</span>
            </div>
            <div className="stat">
              <span className="stat-label">Body Fat:</span>
              <span className="stat-value">{currentEntry.body_fat}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Lean Mass:</span>
              <span className="stat-value">{currentEntry.lean_mass} kg</span>
            </div>
          </div>
          {currentEntry.notes && (
            <div className="entry-notes">
              <strong>Notes:</strong> {currentEntry.notes}
            </div>
          )}
        </div>
      )}

      <div className="photos-container">
        {loading ? (
          <div className="loading">Loading photos...</div>
        ) : selectedDate && photos[selectedDate] ? (
          photos[selectedDate].length > 0 ? (
            <div className="photos-grid">
              {photos[selectedDate].map((photo) => (
                <div key={photo.id} className="photo-item">
                  <img
                    src={getPhotoUrl(photo.filename)}
                    alt={`Progress photo from ${selectedDate}`}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <div className="photo-info">
                    <div className="photo-name">{photo.original_name}</div>
                    <div className="photo-date">
                      {new Date(photo.uploaded_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-photos">
              <div className="no-photos-icon">📸</div>
              <h3>No photos for this date</h3>
              <p>Add photos when creating new entries to see them here.</p>
            </div>
          )
        ) : (
          <div className="no-photos">
            <div className="no-photos-icon">📅</div>
            <h3>Select a date</h3>
            <p>Choose a date from the dropdown to view progress photos.</p>
          </div>
        )}
      </div>

      {datesWithEntries.length === 0 && (
        <div className="no-entries">
          <div className="no-entries-icon">📈</div>
          <h3>No entries yet</h3>
          <p>Add your first entry to start tracking progress photos.</p>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
