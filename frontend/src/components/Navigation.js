import React from 'react';
import './Navigation.css';

const Navigation = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'entry', label: 'Add Entry', icon: '➕' },
    { id: 'charts', label: 'Charts', icon: '📈' },
    { id: 'photos', label: 'Photos', icon: '📸' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>🏋️ Fitness Tracker</h1>
      </div>
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
