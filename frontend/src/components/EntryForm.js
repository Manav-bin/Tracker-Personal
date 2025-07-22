import React, { useState } from 'react';
import './EntryForm.css';

const EntryForm = ({ onSubmit, onPhotoUpload }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat: '',
    notes: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit the entry data
      const success = await onSubmit({
        date: formData.date,
        weight: parseFloat(formData.weight),
        body_fat: parseFloat(formData.body_fat),
        notes: formData.notes
      });

      if (success) {
        // Upload photos if any are selected
        for (const file of selectedFiles) {
          await onPhotoUpload({
            file: file,
            date: formData.date
          });
        }

        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          weight: '',
          body_fat: '',
          notes: ''
        });
        setSelectedFiles([]);

        alert('Entry added successfully!');
      } else {
        alert('Failed to add entry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="entry-form">
      <header className="form-header">
        <h2>Add New Entry</h2>
        <p>Record your daily progress</p>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-section">
          <h3>📅 Entry Details</h3>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                placeholder="75.5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="body_fat">Body Fat (%)</label>
              <input
                type="number"
                id="body_fat"
                name="body_fat"
                value={formData.body_fat}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="100"
                placeholder="15.5"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="How are you feeling today? Any observations?"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>📸 Progress Photos</h3>

          <div className="form-group">
            <label htmlFor="photos">Upload Photos (Optional)</label>
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <p>{selectedFiles.length} file(s) selected:</p>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !formData.weight || !formData.body_fat}
          >
            {isSubmitting ? 'Adding Entry...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
