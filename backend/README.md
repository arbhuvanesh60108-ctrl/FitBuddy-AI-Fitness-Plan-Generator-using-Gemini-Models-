# FitBuddy - Activity 2.2: FastAPI Backend Routing and User Input Processing

This directory contains the complete Python FastAPI backend developed for **Activity 2.2 (Milestone 3)** of the FitBuddy application.

## 🚀 Setup & Execution Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Gemini API Key
```bash
export GEMINI_API_KEY="your_api_key_here"
```

### 3. Run FastAPI Application
```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --reload --port 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📂 Architecture Overview

- **`routes.py`**: Core FastAPI router defining all route handlers:
  - `GET /`: Renders `index.html` (Form input).
  - `POST /generate-workout`: Processes Form parameters, saves user to SQLite, invokes `generate_workout_gemini` and `generate_nutrition_tip_with_flash`, and renders `result.html`.
  - `POST /submit-feedback`: Reads feedback form, retrieves original plan from SQLite, updates it via Gemini, and re-renders `result.html`.
  - `POST /generate-workout/gemini`: JSON API endpoint using `WorkoutRequest` Pydantic model.
  - `GET /nutrition-tip`: JSON API endpoint returning Gemini Flash tips.
  - `POST /generate-plan`: JSON API endpoint using `UserInput` Pydantic model.
  - `POST /update-plan/{user_id}`: JSON API endpoint using `FeedbackRequest` Pydantic model.
- **`schemas.py`**: Pydantic models for request validation (`UserInput`, `WorkoutRequest`, `FeedbackRequest`).
- **`ai_services.py`**: Interfaces with Google Gemini Pro and Flash.
- **`database.py`**: Lightweight SQLite persistence layer for users and workout plans.
- **`templates/`**: Jinja2 HTML templates (`index.html` and `result.html`) with `<pre>` formatting.
