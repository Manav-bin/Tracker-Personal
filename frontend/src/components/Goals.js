import React, { useState, useEffect } from 'react';
import './Goals.css';

const Goals = ({ goals, onUpdateGoals }) => {
  const [formData, setFormData] = useState({
    start_weight: '',
    target_weight: '',
    start_body_fat: '',
    target_body_fat: '',
    target_date: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goals) {
      setFormData({
        start_weight: goals.start_weight || '',
        target_weight: goals.target_weight || '',
        start_body_fat: goals.start_body_fat || '',
        target_body_fat: goals.target_body_fat || '',
        target_date: goals.target_date || ''
      });
    }
  }, [goals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onUpdateGoals({
        start_weight: parseFloat(formData.start_weight) || null,
        target_weight: parseFloat(formData.target_weight) || null,
        start_body_fat: parseFloat(formData.start_body_fat) || null,
        target_body_fat: parseFloat(formData.target_body_fat) || null,
        target_date: formData.target_date || null
      });

      if (success) {
        alert('Goals updated successfully!');
      } else {
        alert('Failed to update goals. Please try again.');
      }
    } catch (error) {
      console.error('Error updating goals:', error);
      alert('Failed to update goals. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    // This would need current stats to calculate actual progress
    // For now, just return placeholder data
    return {
      weightProgress: 0,
      bodyFatProgress: 0
    };
  };

  const { weightProgress, bodyFatProgress } = calculateProgress();

  return (
    <div className="goals">
      <header className="goals-header">
        <h2>Your Fitness Goals</h2>
        <p>Set and track your targets</p>
      </header>

      <div className="goals-content">
        <div className="progress-overview">
          <h3>🎯 Current Progress</h3>
          <div className="progress-items">
            <div className="progress-item">
              <div className="progress-label">Weight Goal Progress</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${weightProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">{weightProgress}% Complete</div>
            </div>

            <div className="progress-item">
              <div className="progress-label">Body Fat Goal Progress</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${bodyFatProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">{bodyFatProgress}% Complete</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="goals-form">
          <h3>📝 Update Your Goals</h3>

          <div className="form-section">
            <h4>Weight Goals</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_weight">Starting Weight (kg)</label>
                <input
                  type="number"
                  id="start_weight"
                  name="start_weight"
                  value={formData.start_weight}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  placeholder="80.0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="target_weight">Target Weight (kg)</label>
                <input
                  type="number"
                  id="target_weight"
                  name="target_weight"
                  value={formData.target_weight}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  placeholder="75.0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Body Composition Goals</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_body_fat">Starting Body Fat (%)</label>
                <input
                  type="number"
                  id="start_body_fat"
                  name="start_body_fat"
                  value={formData.start_body_fat}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="25.0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="target_body_fat">Target Body Fat (%)</label>
                <input
                  type="number"
                  id="target_body_fat"
                  name="target_body_fat"
                  value={formData.target_body_fat}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="15.0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Timeline</h4>
            <div className="form-group">
              <label htmlFor="target_date">Target Date (Optional)</label>
              <input
                type="date"
                id="target_date"
                name="target_date"
                value={formData.target_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Goals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Goals;
