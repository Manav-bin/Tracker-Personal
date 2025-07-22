# 🏋️ Fitness Progress Tracker

A full-stack web application for tracking your fitness journey with weight, body fat percentage, and progress photos. Built with Flask (Python) backend and React frontend, designed to run locally on Ubuntu/RHEL servers.

## ✨ Features

- **📊 Dashboard**: Overview of your current stats and progress
- **➕ Data Entry**: Add daily weight, body fat percentage, and notes
- **📈 Interactive Charts**: Visualize your progress with beautiful charts
- **📸 Photo Gallery**: Upload and organize progress photos by date
- **🎯 Goal Setting**: Set and track your fitness targets
- **🔒 Privacy First**: All data stored locally on your server
- **🐳 Dockerized**: Easy deployment with Docker

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Ubuntu 20.04+ or RHEL 8+
- 2GB+ available disk space

### Installation

1. **Clone or download this project:**
   ```bash
   git clone <your-repo-url>
   cd fitness-progress-tracker
   ```
 **Run this if needed from root folder**
    ```docker run --rm -v "$PWD/frontend":/app -w /app node:18-slim sh -c "npm install && npm prune --production"```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

## 🛠️ Manual Installation

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Ubuntu/RHEL
   pip install -r requirements.txt
   ```

2. **Initialize the database:**
   ```bash
   python -c "from app import init_db; init_db()"
   ```

3. **Start the Flask server:**
   ```bash
   python app.py
   ```
   The backend will run on http://localhost:5000

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000

## 📁 Project Structure

```
fitness-progress-tracker/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend Docker config
│   └── uploads/              # Photo storage directory
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.js           # Main React app
│   │   └── index.js         # React entry point
│   ├── public/              # Static files
│   ├── package.json         # Node.js dependencies
│   ├── Dockerfile           # Frontend Docker config
│   └── nginx.conf           # Nginx configuration
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend Configuration
FLASK_ENV=production
DATABASE_URL=sqlite:///fitness_tracker.db
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=16777216  # 16MB

# Frontend Configuration  
REACT_APP_API_URL=http://localhost:5000
```

### Port Configuration

To change the default ports, modify `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "5001:5000"  # Change 5001 to your preferred port
  frontend:
    ports:
      - "3001:80"    # Change 3001 to your preferred port
```

## 🌐 Network Access

### Local Network Access

To access from other devices on your network:

1. **Find your server IP:**
   ```bash
   ip addr show | grep inet
   ```

2. **Update Docker Compose for network access:**
   ```yaml
   services:
     backend:
       ports:
         - "0.0.0.0:5000:5000"
     frontend:
       ports:
         - "0.0.0.0:3000:80"
   ```

3. **Configure firewall (Ubuntu/RHEL):**
   ```bash
   # Ubuntu
   sudo ufw allow 3000
   sudo ufw allow 5000

   # RHEL/CentOS
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --add-port=5000/tcp --permanent
   sudo firewall-cmd --reload
   ```

### Reverse Proxy (Optional)

For production use with a domain name, consider using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 API Endpoints

### Entries
- `GET /api/entries` - Get all entries
- `POST /api/entries` - Add new entry
- `PUT /api/entries/{id}` - Update entry
- `DELETE /api/entries/{id}` - Delete entry

### Photos
- `POST /api/photos/upload` - Upload photo
- `GET /api/photos/{date}` - Get photos for date
- `GET /api/photos/file/{filename}` - Serve photo file

### Goals & Stats
- `GET /api/goals` - Get current goals
- `POST /api/goals` - Update goals
- `GET /api/stats` - Get progress statistics
- `GET /api/health` - Health check

## 💾 Data Management

### Backup

Your data is stored in:
- **Database**: `backend/fitness_tracker.db`
- **Photos**: `backend/uploads/`

Create regular backups:
```bash
# Stop the application
docker-compose down

# Backup database and photos
cp backend/fitness_tracker.db backup_$(date +%Y%m%d).db
tar -czf photos_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Restart application
docker-compose up -d
```

### Import/Export

The application includes import/export functionality through the web interface.

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port 3000
   sudo lsof -i :3000
   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Database locked error:**
   ```bash
   # Stop all containers
   docker-compose down
   # Remove database lock
   rm backend/fitness_tracker.db-shm backend/fitness_tracker.db-wal
   # Restart
   docker-compose up
   ```

3. **Photo upload fails:**
   ```bash
   # Check uploads directory permissions
   chmod 755 backend/uploads
   # Check disk space
   df -h
   ```

4. **Frontend not loading:**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/health
   # Check browser console for errors
   # Clear browser cache
   ```

### Logs

View application logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## 🔒 Security Considerations

- The application is designed for local/private network use
- For internet exposure, add HTTPS/SSL certificates
- Consider adding authentication for multi-user scenarios
- Regularly backup your data
- Keep Docker images updated

## 🔄 Updates

To update the application:

1. **Pull latest code**
2. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop browsers
- Mobile phones
- Tablets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the logs
3. Create an issue with detailed information
4. Include system information (OS, Docker version, etc.)

---

**Enjoy tracking your fitness journey! 💪**
