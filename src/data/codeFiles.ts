export interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const CODE_FILES: CodeFile[] = [
  {
    name: "routes.py",
    path: "backend/routes.py",
    language: "python",
    description: "Core Activity 2.2 routing file handling form parsing, Gemini calls, and Jinja2 TemplateResponses.",
    content: `import os
from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Activity 2.1 AI Services
from ai_services import (
    generate_workout_gemini,
    generate_nutrition_tip_with_flash,
    update_workout_plan
)

# SQLite Database Helper Functions
from database import (
    save_user,
    save_plan,
    get_original_plan,
    update_plan,
    get_user
)

# Pydantic Schemas
from schemas import WorkoutRequest, UserInput, FeedbackRequest

# ---------------------------------------------------------------------------
# Template Configuration
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATE_DIR)

router = APIRouter()

# ---------------------------------------------------------------------------
# HTML Form Handlers (Jinja2 Template Responses)
# ---------------------------------------------------------------------------

@router.get("/")
def home(request: Request):
    """Renders the user input form (index.html)."""
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/generate-workout")
def generate_workout_form(
    request: Request,
    username: str = Form(...),
    user_id: int = Form(...),
    age: int = Form(...),
    weight: float = Form(...),
    goal: str = Form(...),
    intensity: str = Form(...)
):
    """
    Activity 2.2 Core Route:
    - Captures Form parameters from index.html
    - Saves user profile to SQLite
    - Generates 7-day workout plan via Gemini Pro
    - Generates nutrition tip via Gemini Flash
    - Persists plan in SQLite
    - Renders result.html with pre blocks
    """
    try:
        # 1. Save user to SQLite
        save_user(
            user_id=user_id,
            name=username,
            age=age,
            weight=weight,
            goal=goal,
            intensity=intensity
        )

        # 2. Generate 7-day workout plan using Gemini Pro
        plan = generate_workout_gemini({
            "goal": goal,
            "intensity": intensity
        })
        save_plan(user_id, plan)

        # 3. Generate nutrition & recovery tip using Gemini Flash
        nutrition_tip = generate_nutrition_tip_with_flash(goal)

        # 4. Render result.html template
        return templates.TemplateResponse("result.html", {
            "request": request,
            "username": username,
            "user_id": user_id,
            "age": age,
            "weight": weight,
            "goal": goal,
            "intensity": intensity,
            "workout_plan": plan,
            "nutrition_tip": nutrition_tip
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong: {str(e)}")


@router.post("/submit-feedback")
def submit_feedback_form(
    request: Request,
    user_id: int = Form(...),
    feedback: str = Form(...)
):
    """
    Activity 2.2 Feedback Route:
    - Captures user_id and feedback from result.html
    - Retrieves original workout plan from SQLite
    - Passes original + feedback to update_workout_plan() via Gemini
    - Saves updated plan in SQLite
    - Re-renders result.html with modified plan
    """
    try:
        original = get_original_plan(user_id)
        if not original:
            raise HTTPException(status_code=404, detail="Original plan not found for this user.")

        # Update workout plan with Gemini Pro
        updated = update_workout_plan(original, feedback)
        update_plan(user_id, updated)

        # Retrieve user profile
        user = get_user(user_id) or {
            "name": f"User {user_id}",
            "age": "N/A",
            "weight": "N/A",
            "goal": "Customized",
            "intensity": "Adjusted"
        }

        return templates.TemplateResponse("result.html", {
            "request": request,
            "username": user.get("name", f"User {user_id}"),
            "user_id": user_id,
            "age": user.get("age", "N/A"),
            "weight": user.get("weight", "N/A"),
            "goal": user.get("goal", "N/A"),
            "intensity": user.get("intensity", "N/A"),
            "workout_plan": updated,
            "nutrition_tip": None
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong: {str(e)}")


# ---------------------------------------------------------------------------
# REST API Endpoints (as defined in Milestone 3 specifications)
# ---------------------------------------------------------------------------

# 1. API: Generate workout using Gemini Pro
@router.post("/generate-workout/gemini")
async def generate_gemini_workout(request: WorkoutRequest):
    try:
        result = generate_workout_gemini({
            "goal": request.goal,
            "intensity": request.intensity
        })
        return {"model": "gemini-pro", "workout_plan": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. API: Generate nutrition tip using Gemini Flash
@router.get("/nutrition-tip")
def get_flash_tip(goal: str):
    tip = generate_nutrition_tip_with_flash(goal)
    return {"goal": goal, "nutrition_tip": tip}


# 3. API: Save user info & generate plan
@router.post("/generate-plan")
def generate_plan(user_data: UserInput):
    try:
        save_user(
            user_id=user_data.user_id,
            name=user_data.username,
            age=user_data.age,
            weight=user_data.weight,
            goal=user_data.goal,
            intensity=user_data.intensity
        )
        plan = generate_workout_gemini({
            "goal": user_data.goal,
            "intensity": user_data.intensity
        })
        save_plan(user_data.user_id, plan)
        return {
            "message": "Workout plan generated and saved successfully!",
            "workout_plan": plan
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong: {str(e)}")


# 4. API: Update workout plan based on user feedback
@router.post("/update-plan/{user_id}", response_model=dict)
def update_user_plan(user_id: int, data: FeedbackRequest):
    original = get_original_plan(user_id)
    if not original:
        return {"error": "Original plan not found for this user."}
    updated = update_workout_plan(original, data.feedback)
    update_plan(user_id, updated)
    return {"updated_plan": updated}`
  },
  {
    name: "main.py",
    path: "backend/main.py",
    language: "python",
    description: "FastAPI application entry point including the router and starting the Uvicorn server.",
    content: `import uvicorn
from fastapi import FastAPI
from routes import router

app = FastAPI(
    title="FitBuddy - AI Workout Planner",
    description="Activity 2.2 FastAPI Backend to Manage Routing, User Input Processing, and Gemini Integration",
    version="1.0.0"
)

# Include core routes
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`
  },
  {
    name: "schemas.py",
    path: "backend/schemas.py",
    language: "python",
    description: "Pydantic data models for validating structured API payloads.",
    content: `from pydantic import BaseModel

class WorkoutRequest(BaseModel):
    goal: str
    intensity: str

class UserInput(BaseModel):
    user_id: int
    username: str
    age: int
    weight: float
    goal: str
    intensity: str

class FeedbackRequest(BaseModel):
    feedback: str`
  },
  {
    name: "ai_services.py",
    path: "backend/ai_services.py",
    language: "python",
    description: "Activity 2.1 Gemini Pro & Gemini Flash integration functions.",
    content: `import os
from google import genai

# Initialize Gemini Client with API key from environment
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def generate_workout_gemini(data: dict) -> str:
    """
    Activity 2.1: Uses Gemini Pro to create a structured 7-day workout plan.
    Data contains 'goal' and 'intensity'.
    """
    goal = data.get("goal", "General Fitness")
    intensity = data.get("intensity", "Moderate")

    prompt = f"""
You are FitBuddy, an elite personal fitness trainer.
Generate a structured 7-day workout plan for a client with the following profile:
- Fitness Goal: {goal}
- Intensity Level: {intensity}

Requirements:
1. Provide a detailed schedule from Day 1 to Day 7 (including active recovery days).
2. For each day, include:
   - Target Focus / Muscle Groups
   - Warm-up routine (5-10 mins)
   - 3-5 Specific Exercises with Sets, Reps/Duration, and Rest periods
   - Cool-down / Mobility work
3. Keep the output clean, highly readable, structured with clear headings and bullet points for display in <pre> tags.
"""
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt
            )
            return response.text
        except Exception:
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return response.text
            except Exception:
                pass

    return "Sample 7-Day Workout Plan..."

def generate_nutrition_tip_with_flash(goal: str) -> str:
    """
    Activity 2.1: Uses Gemini Flash to generate practical nutrition/recovery guidance.
    """
    prompt = f"""
You are a sports nutritionist. Generate 1 concise, highly actionable nutrition & recovery tip
for an individual whose fitness goal is: "{goal}".
Keep it under 3-4 bullet points with exact macronutrient or hydration guidance.
Format nicely for plain text <pre> display.
"""
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text
        except Exception:
            pass

    return "Sample Nutrition & Recovery Tip..."

def update_workout_plan(original_plan: str, feedback: str) -> str:
    """
    Activity 2.1: Updates an existing workout plan based on user feedback using Gemini.
    """
    prompt = f"""
You are FitBuddy's master trainer.
Original Plan:
{original_plan}

Feedback:
"{feedback}"

Task:
Revise the workout plan to directly incorporate the user's feedback while preserving 7-day progression.
"""
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt
            )
            return response.text
        except Exception:
            pass

    return "Sample Revised Workout Plan..."`
  },
  {
    name: "database.py",
    path: "backend/database.py",
    language: "python",
    description: "SQLite persistence operations for user profiles and workout plan histories.",
    content: `import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fitbuddy.db")

def init_db():
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

init_db()

def save_user(user_id: int, name: str, age: int, weight: float, goal: str, intensity: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (user_id, name, age, weight, goal, intensity)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            name=excluded.name, age=excluded.age, weight=excluded.weight,
            goal=excluded.goal, intensity=excluded.intensity
    """, (user_id, name, age, weight, goal, intensity))
    conn.commit()
    conn.close()

def get_user(user_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, name, age, weight, goal, intensity FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"user_id": row[0], "name": row[1], "age": row[2], "weight": row[3], "goal": row[4], "intensity": row[5]}
    return None

def save_plan(user_id: int, plan: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO workout_plans (user_id, plan_text)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET plan_text=excluded.plan_text, updated_at=CURRENT_TIMESTAMP
    """, (user_id, plan))
    conn.commit()
    conn.close()

def get_original_plan(user_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT plan_text FROM workout_plans WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def update_plan(user_id: int, new_plan: str):
    save_plan(user_id, new_plan)`
  },
  {
    name: "index.html",
    path: "backend/templates/index.html",
    language: "html",
    description: "Jinja2 HTML form collecting username, user_id, age, weight, goal, and intensity.",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FitBuddy - AI Workout Generator</title>
</head>
<body>
    <div class="card">
        <h2>💪 FitBuddy - AI Workout Generator</h2>
        <form action="/generate-workout" method="POST">
            <div>
                <label for="username">Name:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div>
                <label for="user_id">User ID:</label>
                <input type="number" id="user_id" name="user_id" required>
            </div>
            <div>
                <label for="age">Age:</label>
                <input type="number" id="age" name="age" required>
            </div>
            <div>
                <label for="weight">Weight (kg):</label>
                <input type="number" step="0.1" id="weight" name="weight" required>
            </div>
            <div>
                <label for="goal">Fitness Goal:</label>
                <input type="text" id="goal" name="goal" placeholder="e.g. weight loss, flexibility" required>
            </div>
            <div>
                <label for="intensity">Workout Intensity:</label>
                <select id="intensity" name="intensity" required>
                    <option value="Low">Low</option>
                    <option value="Moderate" selected>Moderate</option>
                    <option value="High">High</option>
                </select>
            </div>
            <button type="submit">Generate Plan</button>
        </form>
    </div>
</body>
</html>`
  },
  {
    name: "result.html",
    path: "backend/templates/result.html",
    language: "html",
    description: "Jinja2 result view with <pre> formatted workout plan, nutrition tip, and feedback form.",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FitBuddy - Your Personalized Workout Plan</title>
</head>
<body>
    <div class="container">
        <h1>🏋️ Your Personalized Workout Plan</h1>
        <h2>User Information</h2>

        <div class="user-info">
            <div><strong>Name:</strong> {{ username }}</div>
            <div><strong>User ID:</strong> {{ user_id }}</div>
            <div><strong>Age:</strong> {{ age }}</div>
            <div><strong>Weight:</strong> {{ weight }} kg</div>
            <div><strong>Goal:</strong> {{ goal }}</div>
            <div><strong>Intensity:</strong> {{ intensity }}</div>
        </div>

        <div class="section-title">Workout Plan</div>
        <pre>{{ workout_plan }}</pre>

        {% if nutrition_tip %}
        <div class="section-title">🥗 Nutrition & Recovery Tip</div>
        <pre>{{ nutrition_tip }}</pre>
        {% endif %}

        <div class="feedback-card">
            <h3>📝 Share Your Feedback</h3>
            <form action="/submit-feedback" method="POST">
                <input type="number" id="feedback_user_id" name="user_id" value="{{ user_id }}" required>
                <textarea id="feedback_text" name="feedback" required></textarea>
                <button type="submit">Submit Feedback</button>
            </form>
        </div>
    </div>
</body>
</html>`
  },
  {
    name: "requirements.txt",
    path: "backend/requirements.txt",
    language: "text",
    description: "Python package dependencies for the FastAPI backend.",
    content: `fastapi==0.115.0
uvicorn==0.31.0
jinja2==3.1.4
pydantic==2.9.2
python-multipart==0.0.12
google-genai==0.1.1`
  }
];
