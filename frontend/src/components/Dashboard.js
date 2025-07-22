import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ entries = [], stats = {}, goals = {} }) {
  // AI forecast state
  const [forecast, setForecast] = useState([]);

  // Fetch /api/forecast exactly once on mount
  useEffect(() => {
    fetch('/api/forecast')
      .then(r => r.json())
      .then(setForecast)
      .catch(() => setForecast([]));
  }, []);

  // Helper for latest entry
  const latest = entries.at(-1);

  // Chart: show last 10 entries
  const recent = [...entries].slice(-10);

  const chartData = {
    labels: recent
      .concat(forecast)
      .map(e => new Date(e.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: recent.map(e => e.weight),
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.15)',
        tension: 0.3,
        pointRadius: 3,
      },
      ...(forecast.length
        ? [
            {
              label: 'AI-Predicted Weight',
              data: [
                ...new Array(recent.length).fill(null),
                ...forecast.map(p => p.predicted_weight),
              ],
              borderColor: '#ff6384',
              borderDash: [6, 4],
              fill: false,
              tension: 0.3,
              pointRadius: 0,
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          filter: (item) => typeof item.text === 'string' && item.text.length > 0,
        },
      },
      title: { display: true, text: 'Weight Trend (last 10 entries)' },
    },
    scales: { y: { beginAtZero: false } },
  };

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <h2>Your Progress Dashboard</h2>
        <p className="dashboard-subtitle">Track your fitness journey</p>
      </header>

      <div className="stats-grid">
        <StatCard
          icon="⚖️"
          label="Current Weight"
          value={latest ? `${latest.weight.toFixed(1)} kg` : '-- kg'}
          delta={stats.change?.weight}
          isPositive={stats.change?.weight < 0}
        />
        <StatCard
          icon="📊"
          label="Body Fat"
          value={latest ? `${latest.body_fat.toFixed(1)} %` : '-- %'}
          delta={stats.change?.body_fat}
          isPositive={stats.change?.body_fat < 0}
        />
        <StatCard
          icon="💪"
          label="Lean Mass"
          value={latest ? `${latest.lean_mass.toFixed(1)} kg` : '-- kg'}
        />
        <StatCard
          icon="🎯"
          label="Target Weight"
          value={goals.target_weight ? `${goals.target_weight} kg` : 'Not set'}
        />
      </div>

      <div className="chart-card">
        {entries.length === 0 ? (
          <div className="empty-state">
            <p>No entries yet.</p>
            <p>Add your first record to see progress!</p>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      <div className="recent-card">
        <h3>Recent Entries</h3>
        {entries.length === 0 ? (
          <p className="empty-note">Nothing to show—start logging!</p>
        ) : (
          <ul className="entries-list">
            {[...entries].slice(-5).reverse().map(e => (
              <li key={e.id} className="entry-item">
                <span className="entry-date">
                  {new Date(e.date).toLocaleDateString()}
                </span>
                <span className="entry-values">
                  {e.weight} kg&nbsp;&nbsp;|&nbsp;&nbsp;{e.body_fat} %
                </span>
                {e.notes && <em className="entry-notes">{e.notes}</em>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// Small reusable tile
function StatCard({ icon, label, value, delta, isPositive }) {
  return (
    <article className="stat-card">
      <span className="stat-icon" aria-hidden>
        {icon}
      </span>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {delta !== undefined && (
          <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
            {delta > 0 ? '+' : ''}
            {delta.toFixed(1)}
            {label === 'Body Fat' ? '%' : ' kg'}
          </span>
        )}
      </div>
    </article>
  );
}

