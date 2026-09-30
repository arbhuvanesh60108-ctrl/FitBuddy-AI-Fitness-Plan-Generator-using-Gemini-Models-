import os
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
    return {"updated_plan": updated}
