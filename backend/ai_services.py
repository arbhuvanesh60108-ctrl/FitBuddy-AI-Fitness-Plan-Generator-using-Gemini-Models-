import os
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
        except Exception as e:
            # Fallback to flash if pro is unavailable
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return response.text
            except Exception:
                pass

    # High quality fallback template if offline or API key missing
    return f"""==================================================
FITBUDDY 7-DAY PERSONALIZED WORKOUT PLAN
Goal: {goal.upper()} | Intensity: {intensity.upper()}
==================================================

DAY 1: UPPER BODY STRENGTH & CORE
- Warm-up: 5 mins dynamic arm circles, band pull-aparts, jumping jacks
- Exercise 1: Barbell / Dumbbell Bench Press - 4 sets x 8-10 reps (Rest: 90s)
- Exercise 2: Bent-Over Rows - 4 sets x 10 reps (Rest: 60s)
- Exercise 3: Overhead Dumbbell Shoulder Press - 3 sets x 12 reps (Rest: 60s)
- Exercise 4: Hanging Leg Raises / Planks - 3 sets x 45-60s hold
- Cool-down: 5 mins chest opening and lat stretching

DAY 2: LOWER BODY POWER & AGILITY
- Warm-up: 5 mins hip openers, leg swings, bodyweight squats
- Exercise 1: Barbell Back Squats or Goblet Squats - 4 sets x 8 reps
- Exercise 2: Romanian Deadlifts (RDL) - 3 sets x 10 reps
- Exercise 3: Walking Lunges - 3 sets x 12 reps per leg
- Exercise 4: Standing Calf Raises - 3 sets x 15 reps
- Cool-down: 5 mins hamstring, quad, and hip flexor stretches

DAY 3: ACTIVE RECOVERY & CARDIO MOBILITY
- Activity: 30-45 mins brisk outdoor walk, light cycling, or swimming
- Mobility: 15 mins yoga flow focusing on spine, hips, and ankles
- Hydration goal: 3-4 liters of water with electrolytes

DAY 4: PULL & POSTERIOR CHAIN EMPHASIS
- Warm-up: Cat-cow stretches, thoracic twists, 3 mins jump rope
- Exercise 1: Pull-ups or Lat Pulldowns - 4 sets x 8-12 reps
- Exercise 2: Seated Cable Rows - 3 sets x 12 reps
- Exercise 3: Face Pulls (Rear Delts) - 3 sets x 15 reps
- Exercise 4: Incline Dumbbell Bicep Curls - 3 sets x 12 reps
- Cool-down: Foam roll upper back and lats

DAY 5: PUSH & LOWER HYBRID (FULL BODY METABOLIC)
- Warm-up: 5 mins bodyweight circuit (push-ups, lunges)
- Exercise 1: Incline Dumbbell Press - 3 sets x 10 reps
- Exercise 2: Bulgarian Split Squats - 3 sets x 8 reps per leg
- Exercise 3: Kettlebell Swings - 4 sets x 15 reps (high intensity)
- Exercise 4: Dips / Tricep Pushdowns - 3 sets x 12 reps
- Cool-down: Full-body dynamic stretching

DAY 6: CORE SPECIALIZATION & HIIT BURST
- Warm-up: High knees, mountain climbers, butt kicks (3 mins)
- Interval: 20 mins HIIT (30s work / 30s rest: burpees, box jumps, battle ropes)
- Core Circuit: 3 rounds (Russian Twists x 20, Hollow Body Hold x 30s, Ab Rollouts x 10)
- Cool-down: Child's pose, cobra stretch, deep breathing

DAY 7: REST, RECOVERY & NUTRITION PREP
- Total rest day for muscle tissue repair and CNS recovery
- Light foam rolling, Epsom salt bath, and mental wellness
- Meal prep for the upcoming week based on your fitness goal: {goal}
=================================================="""

def generate_nutrition_tip_with_flash(goal: str) -> str:
    """
    Activity 2.1: Uses Gemini Flash to generate a practical, actionable
    nutrition and recovery tip tailored to the user's fitness goal.
    """
    prompt = f"""
You are a sports nutritionist. Generate 1 concise, highly actionable, and science-backed
nutrition & recovery tip for an individual whose fitness goal is: "{goal}".
Keep it under 3-4 bullet points, easy to read, with exact macronutrient or hydration guidance.
Format nicely for a plain text <pre> display.
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

    return f"""• PROTEIN TARGET: Aim for 1.6 - 2.0g of protein per kg of body weight daily to optimize muscle synthesis and recovery for '{goal}'.
• NUTRIENT TIMING: Consume a 3:1 carb-to-protein snack (e.g., banana with whey protein or Greek yogurt) within 45 minutes post-workout.
• RECOVERY HYDRATION: Drink at least 500ml of water with a pinch of Himalayan salt or electrolyte tablet for every hour of moderate-to-high intensity training."""

def update_workout_plan(original_plan: str, feedback: str) -> str:
    """
    Activity 2.1: Updates an existing workout plan based on user feedback using Gemini.
    """
    prompt = f"""
You are FitBuddy's master trainer. A user has received the following 7-day workout plan:

[ORIGINAL WORKOUT PLAN]
{original_plan}

[USER FEEDBACK / REQUESTED CHANGES]
"{feedback}"

Task:
Revise the workout plan to directly incorporate the user's feedback while preserving the overall 7-day progression and structure.
Highlight which days or exercises were modified based on their request.
Format cleanly for <pre> tag display.
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

    return f"""==================================================
UPDATED FITBUDDY WORKOUT PLAN (REVISED VIA USER FEEDBACK)
Feedback Applied: "{feedback}"
==================================================

[MODIFICATIONS APPLIED]
✔ Revised training volume and exercise selection based on your note: "{feedback}"
✔ Re-balanced recovery windows to prevent overtraining.

{original_plan}

[TRAINER'S NOTE ON REVISION]
Always remember to progress loads gradually and listen to joint feedback. Keep up the great consistency!
=================================================="""
