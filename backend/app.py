from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def init_db():
    conn = sqlite3.connect('fitness_tracker.db')
    cursor = conn.cursor()

    # Create entries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL UNIQUE,
            weight REAL NOT NULL,
            body_fat REAL NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create photos table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id TEXT PRIMARY KEY,
            entry_date TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create goals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY,
            start_weight REAL,
            target_weight REAL,
            start_body_fat REAL,
            target_body_fat REAL,
            target_date TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('fitness_tracker.db')
    conn.row_factory = sqlite3.Row
    return conn

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/entries', methods=['GET'])
def get_entries():
    conn = get_db_connection()
    entries = conn.execute('SELECT * FROM entries ORDER BY date DESC').fetchall()
    conn.close()

    entries_list = []
    for entry in entries:
        entry_dict = dict(entry)
        fat_mass = entry_dict['weight'] * entry_dict['body_fat'] / 100
        lean_mass = entry_dict['weight'] - fat_mass
        entry_dict['fat_mass'] = round(fat_mass, 2)
        entry_dict['lean_mass'] = round(lean_mass, 2)
        entries_list.append(entry_dict)

    return jsonify(entries_list)

@app.route('/api/entries', methods=['POST'])
def add_entry():
    data = request.get_json()

    if not data or not all(k in data for k in ('date', 'weight', 'body_fat')):
        return jsonify({'error': 'Missing required fields'}), 400

    entry_id = str(uuid.uuid4())

    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT OR REPLACE INTO entries (id, date, weight, body_fat, notes) VALUES (?, ?, ?, ?, ?)',
            (entry_id, data['date'], data['weight'], data['body_fat'], data.get('notes', ''))
        )
        conn.commit()
        conn.close()

        return jsonify({'id': entry_id, 'message': 'Entry added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/photos/upload', methods=['POST'])
def upload_photo():
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400

    file = request.files['photo']
    entry_date = request.form.get('date')

    if not entry_date:
        return jsonify({'error': 'Date is required'}), 400

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

        file.save(file_path)

        photo_id = str(uuid.uuid4())
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO photos (id, entry_date, filename, original_name) VALUES (?, ?, ?, ?)',
            (photo_id, entry_date, unique_filename, filename)
        )
        conn.commit()
        conn.close()

        return jsonify({
            'id': photo_id,
            'filename': unique_filename,
            'message': 'Photo uploaded successfully'
        }), 201

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/photos/<date>')
def get_photos_by_date(date):
    conn = get_db_connection()
    photos = conn.execute(
        'SELECT * FROM photos WHERE entry_date = ? ORDER BY uploaded_at',
        (date,)
    ).fetchall()
    conn.close()

    return jsonify([dict(photo) for photo in photos])

@app.route('/api/photos/file/<filename>')
def get_photo_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/goals', methods=['GET'])
def get_goals():
    conn = get_db_connection()
    goals = conn.execute('SELECT * FROM goals ORDER BY updated_at DESC LIMIT 1').fetchone()
    conn.close()

    if goals:
        return jsonify(dict(goals))
    else:
        return jsonify({
            'start_weight': 80,
            'target_weight': 75,
            'start_body_fat': 25,
            'target_body_fat': 15,
            'target_date': None
        })

@app.route('/api/goals', methods=['POST'])
def set_goals():
    data = request.get_json()

    conn = get_db_connection()

    # Delete existing goals and insert new ones
    conn.execute('DELETE FROM goals')
    conn.execute(
        '''INSERT INTO goals (start_weight, target_weight, start_body_fat, 
           target_body_fat, target_date) VALUES (?, ?, ?, ?, ?)''',
        (data.get('start_weight'), data.get('target_weight'),
         data.get('start_body_fat'), data.get('target_body_fat'),
         data.get('target_date'))
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Goals updated successfully'})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()

    # Get latest entry
    latest = conn.execute('SELECT * FROM entries ORDER BY date DESC LIMIT 1').fetchone()

    # Get first entry
    first = conn.execute('SELECT * FROM entries ORDER BY date ASC LIMIT 1').fetchone()

    # Get goals
    goals = conn.execute('SELECT * FROM goals ORDER BY updated_at DESC LIMIT 1').fetchone()

    conn.close()

    stats = {}

    if latest:
        stats['current'] = {
            'weight': latest['weight'],
            'body_fat': latest['body_fat'],
            'fat_mass': round(latest['weight'] * latest['body_fat'] / 100, 2),
            'lean_mass': round(latest['weight'] * (1 - latest['body_fat'] / 100), 2),
            'date': latest['date']
        }

    if first and latest and first['date'] != latest['date']:
        stats['change'] = {
            'weight': round(latest['weight'] - first['weight'], 2),
            'body_fat': round(latest['body_fat'] - first['body_fat'], 2)
        }

    if goals:
        stats['goals'] = dict(goals)

    return jsonify(stats)

# --- AI FORECAST ENDPOINT -----------------------------------------------
# Returns 10-day weight prediction using Prophet
from prophet import Prophet          # NEW

@app.route('/api/forecast', methods=['GET'])
def forecast_weight():
    conn = get_db_connection()
    rows = conn.execute('SELECT date, weight FROM entries ORDER BY date').fetchall()
    conn.close()

    # nothing logged yet ?  respond with empty list
    if not rows:
        return jsonify([])

    # ─── Prepare dataframe for Prophet ───────────────────────────────────
    import pandas as pd
    df = pd.DataFrame(rows, columns=['ds', 'y'])   # Prophet expects ds / y
    df['ds'] = pd.to_datetime(df['ds'])

    # ─── Train & predict 30 future days ─────────────────────────────────
    m = Prophet(daily_seasonality=False, weekly_seasonality=False)
    m.fit(df)
    future = m.make_future_dataframe(periods=10)
    forecast = m.predict(future)[['ds', 'yhat']].tail(10)

    # round result for front-end neatness
    records = [
        {'date': r.ds.strftime('%Y-%m-%d'), 'predicted_weight': round(r.yhat, 1)}
        for r in forecast.itertuples()
    ]
    return jsonify(records)
# ------------------------------------------------------------------------
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
