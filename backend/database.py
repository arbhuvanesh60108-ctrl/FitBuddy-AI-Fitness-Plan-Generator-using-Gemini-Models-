import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fitbuddy.db")

def init_db():
    """Initializes SQLite tables for users and workout plans."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            weight REAL,
            goal TEXT,
            intensity TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workout_plans (
            user_id INTEGER PRIMARY KEY,
            plan_text TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
    """)
    conn.commit()
    conn.close()

# Auto-initialize database on module import
init_db()

def save_user(user_id: int, name: str, age: int, weight: float, goal: str, intensity: str):
    """Inserts or updates user profile in SQLite."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (user_id, name, age, weight, goal, intensity)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            name=excluded.name,
            age=excluded.age,
            weight=excluded.weight,
            goal=excluded.goal,
            intensity=excluded.intensity
    """, (user_id, name, age, weight, goal, intensity))
    conn.commit()
    conn.close()

def get_user(user_id: int):
    """Retrieves user profile dictionary by user_id."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, name, age, weight, goal, intensity FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "user_id": row[0],
            "name": row[1],
            "age": row[2],
            "weight": row[3],
            "goal": row[4],
            "intensity": row[5]
        }
    return None

def save_plan(user_id: int, plan: str):
    """Saves or updates 7-day workout plan text for a user."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO workout_plans (user_id, plan_text)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            plan_text=excluded.plan_text,
            updated_at=CURRENT_TIMESTAMP
    """, (user_id, plan))
    conn.commit()
    conn.close()

def get_original_plan(user_id: int) -> str | None:
    """Retrieves current workout plan for a user."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT plan_text FROM workout_plans WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def update_plan(user_id: int, new_plan: str):
    """Updates workout plan for a user."""
    save_plan(user_id, new_plan)
