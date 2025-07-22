FROM python:3.11-slim

# system libs for Prophet / pystan
RUN apt-get update && apt-get install -y build-essential g++ && \
    rm -rf /var/lib/apt/lists/*
    
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Initialize database
RUN python -c "from app import init_db; init_db()"

EXPOSE 5000

CMD ["python", "app.py"]
