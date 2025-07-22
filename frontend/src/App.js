import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import Charts from './components/Charts';
import PhotoGallery from './components/PhotoGallery';
import Goals from './components/Goals';
import Navigation from './components/Navigation';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({});
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, statsRes, goalsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/entries`),
        axios.get(`${API_BASE_URL}/api/stats`),
        axios.get(`${API_BASE_URL}/api/goals`)
      ]);

      setEntries(entriesRes.data);
      setStats(statsRes.data);
      setGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entryData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/entries`, entryData);
      await fetchData(); // Refresh all data
      return true;
    } catch (error) {
      console.error('Error adding entry:', error);
      return false;
    }
  };

  const updateGoals = async (goalsData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/goals`, goalsData);
      await fetchData(); // Refresh all data
      return true;
    } catch (error) {
      console.error('Error updating goals:', error);
      return false;
    }
  };

  const uploadPhoto = async (photoData) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoData.file);
      formData.append('date', photoData.date);

      await axios.post(`${API_BASE_URL}/api/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return true;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navigation activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        {activeView === 'dashboard' && (
          <Dashboard entries={entries} stats={stats} goals={goals} />
        )}
        {activeView === 'entry' && (
          <EntryForm onSubmit={addEntry} onPhotoUpload={uploadPhoto} />
        )}
        {activeView === 'charts' && (
          <Charts entries={entries} goals={goals} />
        )}
        {activeView === 'photos' && (
          <PhotoGallery entries={entries} />
        )}
        {activeView === 'goals' && (
          <Goals goals={goals} onUpdateGoals={updateGoals} />
        )}
      </main>
    </div>
  );
}

export default App;
