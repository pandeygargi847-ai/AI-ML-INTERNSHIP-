DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS scans;

CREATE TABLE scans(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    health_score INTEGER,
    fatigue_level TEXT,
    stress_level TEXT,
    mood TEXT,
    sleep_quality TEXT,
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
);


DROP TABLE IF EXISTS symptoms;

CREATE TABLE symptoms(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,

    headache INTEGER,
    fever INTEGER,
    cough INTEGER,
    dizziness INTEGER,
    body_pain INTEGER,
    chest_pain INTEGER,
    vomiting INTEGER,

    prediction TEXT,
    recommendation TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
);