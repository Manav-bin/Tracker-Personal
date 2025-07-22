import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ entries, goals }) => {
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Weight progression chart
  const weightData = {
    labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: sortedEntries.map(entry => entry.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      ...(goals.target_weight ? [{
        label: 'Target Weight',
        data: new Array(sortedEntries.length).fill(goals.target_weight),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
      }] : [])
    ],
  };

  // Body composition chart
  const compositionData = {
    labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Fat Mass (kg)',
        data: sortedEntries.map(entry => entry.fat_mass),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        stack: 'composition',
      },
      {
        label: 'Lean Mass (kg)',
        data: sortedEntries.map(entry => entry.lean_mass),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        stack: 'composition',
      },
    ],
  };

  // Body fat percentage chart
  const bodyFatData = {
    labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Body Fat (%)',
        data: sortedEntries.map(entry => entry.body_fat),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.1,
      },
      ...(goals.target_body_fat ? [{
        label: 'Target Body Fat',
        data: new Array(sortedEntries.length).fill(goals.target_body_fat),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
      }] : [])
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="charts">
      <header className="charts-header">
        <h2>Progress Charts</h2>
        <p>Visualize your fitness journey</p>
      </header>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Weight Progress</h3>
          <div className="chart-container">
            <Line data={weightData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Body Fat Percentage</h3>
          <div className="chart-container">
            <Line data={bodyFatData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Body Composition (Fat vs Lean Mass)</h3>
          <div className="chart-container">
            <Bar data={compositionData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {sortedEntries.length > 0 && (
        <div className="progress-summary">
          <h3>Progress Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Weight Change:</span>
              <span className={`summary-value ${
                sortedEntries[sortedEntries.length - 1].weight - sortedEntries[0].weight < 0 
                  ? 'positive' : 'negative'
              }`}>
                {(sortedEntries[sortedEntries.length - 1].weight - sortedEntries[0].weight).toFixed(1)} kg
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Body Fat Change:</span>
              <span className={`summary-value ${
                sortedEntries[sortedEntries.length - 1].body_fat - sortedEntries[0].body_fat < 0 
                  ? 'positive' : 'negative'
              }`}>
                {(sortedEntries[sortedEntries.length - 1].body_fat - sortedEntries[0].body_fat).toFixed(1)}%
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Days Tracked:</span>
              <span className="summary-value">
                {Math.ceil((new Date(sortedEntries[sortedEntries.length - 1].date) - 
                           new Date(sortedEntries[0].date)) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
