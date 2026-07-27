import sqlite3

DB_NAME = "health_monitor.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        scan_date TEXT,

        health_score INTEGER,

        fatigue TEXT,

        stress TEXT,

        mood TEXT,

        disease TEXT,

        confidence REAL,

        risk TEXT

    )
    """)

    conn.commit()
    conn.close()


def save_report(

    scan_date,
    health_score,
    fatigue,
    stress,
    mood,
    disease,
    confidence,
    risk

):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

    INSERT INTO reports(

        scan_date,
        health_score,
        fatigue,
        stress,
        mood,
        disease,
        confidence,
        risk

    )

    VALUES(?,?,?,?,?,?,?,?)

    """,

    (

        scan_date,
        health_score,
        fatigue,
        stress,
        mood,
        disease,
        confidence,
        risk

    )

    )

    conn.commit()

    conn.close()


def get_reports():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

    SELECT *

    FROM reports

    ORDER BY id DESC

    """)

    data = cursor.fetchall()

    conn.close()

    return data