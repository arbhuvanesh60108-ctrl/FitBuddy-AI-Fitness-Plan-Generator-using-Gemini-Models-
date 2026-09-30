import { GoogleGenAI } from "@google/genai";
import type { IncomingMessage, ServerResponse } from "http";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Progress Tracking Store
export interface ProgressEntry {
  user_id: number;
  completedDays: number[];
  notes: Record<number, string>;
  streak: number;
  lastCompletedDate?: string;
}

const progressStore = new Map<number, ProgressEntry>();
progressStore.set(101, {
  user_id: 101,
  completedDays: [1, 2],
  notes: {
    1: "Hit 4x8 bench press at 80kg. Felt great!",
    2: "Deadlifts felt strong. Subbed barbell rows with chest-supported dumbbells.",
  },
  streak: 2,
  lastCompletedDate: new Date().toISOString(),
});

// Call Gemini for AI Fitness Coach Chat
async function callGeminiChat(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  userProfile?: any
): Promise<string> {
  if (ai) {
    try {
      const profileContext = userProfile
        ? `Client Profile: Name: ${userProfile.name || 'User'}, Age: ${userProfile.age || 25}, Goal: ${userProfile.goal || 'General Fitness'}, Intensity: ${userProfile.intensity || 'Moderate'}.`
        : '';

      const prompt = `You are FitBuddy Coach, an encouraging, certified fitness trainer, strength coach, and sports nutritionist.
${profileContext}

User Query: "${message}"

Guidelines:
1. Give practical, science-backed, beginner-friendly advice.
2. If asking about exercises, explain form cues simply (e.g. "Keep your chest tall, brace your core, drive through midfoot").
3. If asking about nutrition/diet, give actionable whole-food tips with portion ideas.
4. Keep the tone motivational, empathetic, and direct. Keep formatting clean with bullet points where appropriate.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini chat call error:", err);
    }
  }

  // Fallback intelligent responses
  const lower = message.toLowerCase();
  if (lower.includes("sore") || lower.includes("recovery") || lower.includes("rest")) {
    return "Muscle soreness (DOMS) is normal after intense sessions! To recover faster: 1) Drink at least 3L of water with electrolytes, 2) Get 7-9 hours of quality sleep, 3) Do 15 mins of light walking or stretching to promote blood flow, and 4) Ensure you're hitting 1.6-2g of protein per kg of body weight.";
  }
  if (lower.includes("protein") || lower.includes("diet") || lower.includes("food") || lower.includes("eat")) {
    return "For solid nutrition results: Prioritize lean proteins (chicken, fish, eggs, tofu, Greek yogurt) at every meal. Pair with complex carbs (oats, brown rice, sweet potatoes) around workout times, and healthy fats (avocado, nuts, olive oil) for hormone health.";
  }
  if (lower.includes("squat") || lower.includes("bench") || lower.includes("form") || lower.includes("deadlift")) {
    return "Great question on technique! Key form fundamentals: 1) Keep your core braced as if taking a punch, 2) Maintain neutral spine alignment, 3) Control the eccentric (lowering) phase for 2-3 seconds, and 4) Focus on mind-muscle connection rather than just moving heavy weights.";
  }

  return "Consistency is the number one driver of fitness results! Remember to log your daily workouts, prioritize progressive overload by adding 1 extra rep or 1kg when comfortable, and stay hydrated. What specific exercise or nutrition area can I help you fine-tune today?";
}

// Call Gemini for Full Healthy Diet & Meal Suggestions
async function callGeminiDiet(goal: string, dietType?: string, calories?: number): Promise<string> {
  if (ai) {
    try {
      const prompt = `You are FitBuddy's master sports dietitian.
Create a complete, realistic 1-day healthy meal and diet plan for an individual with:
- Fitness Goal: ${goal}
- Dietary Preference: ${dietType || 'Balanced Omnivore'}
- Target Calories: ${calories || 2200} kcal

Provide:
1. Daily Macro Breakdown (Target Calories, Protein grams, Carbs grams, Fats grams).
2. Breakfast (meal details, estimated calories & protein).
3. Lunch (meal details, estimated calories & protein).
4. Afternoon / Pre-Workout Snack.
5. Dinner (meal details, estimated calories & protein).
6. Evening / Recovery Snack.
7. Hydration & Supplementation Tips (e.g. Creatine, Whey, Vitamin D3).
Keep formatting clean and easy to read.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini diet call error:", err);
    }
  }

  return `==================================================
FITBUDDY BALANCED NUTRITION & MEAL PLAN
Goal: ${goal.toUpperCase()} | Calorie Target: ~2,200 kcal
==================================================

MACRONUTRIENT TARGETS:
• Calories: ~2,200 kcal
• Protein: 160g - 175g (30%)
• Carbohydrates: 220g (40%)
• Fats: 70g (30%)

1. BREAKFAST (Power Start)
- 3 Whole eggs scrambled with baby spinach and cherry tomatoes
- 1 Slice sourdough or whole-grain toast with 1/4 avocado
- 1 Cup black coffee or green tea + 500ml water
- Macros: ~480 kcal | 28g Protein

2. LUNCH (Sustained Energy)
- 150g Grilled chicken breast or baked salmon
- 1 Cup cooked quinoa or brown basmati rice
- Steamed broccoli and roasted zucchini with 1 tsp extra virgin olive oil
- Macros: ~560 kcal | 42g Protein

3. PRE-WORKOUT SNACK (90 mins prior)
- 1 Medium banana with 1 tbsp natural peanut butter
- 1 Glass of water with a pinch of sea salt
- Macros: ~230 kcal | 6g Protein

4. POST-WORKOUT DINNER (Muscle Recovery)
- 160g Lean flank steak, ground turkey, or firm tofu stir-fry
- 1 Medium baked sweet potato
- Mixed garden salad with balsamic vinaigrette
- Macros: ~620 kcal | 46g Protein

5. EVENING NUTRITION
- 1 Cup 2% plain Greek yogurt with 1/2 cup blueberries & cinnamon
- Chamomile or peppermint tea for sleep quality
- Macros: ~210 kcal | 22g Protein

HYDRATION & HABITS:
• Drink 3.5 liters of water daily.
• Supplement with 5g Creatine Monohydrate daily at any convenient time.
• Consume 80% whole, minimally processed single-ingredient foods.
==================================================`;
}
export interface StoredUser {
  user_id: number;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  updated_at: string;
}

export interface StoredPlan {
  user_id: number;
  plan_text: string;
  nutrition_tip?: string;
  updated_at: string;
}

const usersStore = new Map<number, StoredUser>();
const plansStore = new Map<number, StoredPlan>();

// Seed with demo data
usersStore.set(101, {
  user_id: 101,
  name: "Alex Rivera",
  age: 26,
  weight: 74.5,
  goal: "Muscle Building & Strength",
  intensity: "High",
  updated_at: new Date().toISOString(),
});

plansStore.set(101, {
  user_id: 101,
  plan_text: `==================================================
FITBUDDY 7-DAY PERSONALIZED WORKOUT PLAN
Goal: MUSCLE BUILDING | Intensity: HIGH
==================================================

DAY 1: CHEST & TRICEPS (HYPERTROPHY FOCUS)
- Warm-up: 5 mins dynamic band pull-aparts, arm circles, push-up walkouts
- Exercise 1: Barbell Bench Press - 4 sets x 8 reps (Rest: 90s)
- Exercise 2: Incline Dumbbell Press - 3 sets x 10 reps (Rest: 60s)
- Exercise 3: Cable Chest Flyes - 3 sets x 12 reps (Rest: 45s)
- Exercise 4: Tricep Rope Pushdowns - 4 sets x 12 reps (Rest: 45s)
- Exercise 5: Overhead Dumbbell Extension - 3 sets x 10 reps
- Cool-down: 5 mins chest door-frame stretches & tricep overhead stretches

DAY 2: BACK & BICEPS (POSTERIOR CHAIN)
- Warm-up: 5 mins foam roll thoracic spine, cat-cow, band face pulls
- Exercise 1: Conventional Deadlifts - 4 sets x 6 reps (Rest: 120s)
- Exercise 2: Wide-Grip Lat Pulldowns - 4 sets x 10 reps (Rest: 60s)
- Exercise 3: Seated Cable Rows - 3 sets x 12 reps (Rest: 60s)
- Exercise 4: Incline Dumbbell Bicep Curls - 3 sets x 12 reps
- Exercise 5: Hammer Curls - 3 sets x 12 reps
- Cool-down: 5 mins lat child's pose and forearm stretches

DAY 3: ACTIVE RECOVERY & MOBILITY
- Activity: 30 mins brisk incline treadmill walk or outdoor jog
- Mobility: 15 mins hip flexor and thoracic rotation mobility routine
- Hydration: 3.5 liters water with recovery electrolytes

DAY 4: SHOULDERS & ABS (OVERHEAD POWER)
- Warm-up: 5 mins arm swings, Cuban presses, light lateral raises
- Exercise 1: Standing Overhead Barbell Press - 4 sets x 8 reps
- Exercise 2: Dumbbell Lateral Raises - 4 sets x 15 reps (Burnout)
- Exercise 3: Rear Delt Cable Flyes - 3 sets x 15 reps
- Exercise 4: Hanging Leg Raises - 3 sets x 15 reps
- Exercise 5: Ab Wheel Rollouts - 3 sets x 10 reps
- Cool-down: 5 mins shoulder dislocation stretch with dowel/band

DAY 5: QUAD & HAMSTRING POWER (LOWER BODY)
- Warm-up: 5 mins leg swings, deep bodyweight squats, glute bridges
- Exercise 1: Barbell Back Squats - 4 sets x 8 reps (Rest: 90s)
- Exercise 2: Romanian Deadlifts - 4 sets x 10 reps (Rest: 75s)
- Exercise 3: Leg Press (Feet shoulder-width) - 3 sets x 12 reps
- Exercise 4: Seated Leg Curls - 3 sets x 12 reps
- Exercise 5: Standing Calf Raises - 4 sets x 15 reps
- Cool-down: 8 mins quad couch stretch and pigeon pose

DAY 6: FUNCTIONAL HIIT & CORE FINISHER
- Warm-up: 3 mins jump rope, high knees
- HIIT Circuit: 4 rounds (45s on / 15s off)
  • Kettlebell Swings (24kg)
  • Dumbbell Thrusters
  • Box Jumps / Step-ups
  • Battle Ropes / Mountain Climbers
- Core Burnout: 2 min continuous plank variation
- Cool-down: Full-body yoga flow

DAY 7: REST, RECOVERY & NUTRITION PREP
- Full physical rest for nervous system and muscular repair
- Optional: 20 min sauna or warm Epsom salt bath
- Meal Prep: Prepare high-protein lean meals for the upcoming week
==================================================`,
  nutrition_tip: `• PROTEIN SYNTHESIS: Maintain 1.8g to 2.2g of high-quality protein per kilogram of body weight spread across 4 equal meals.
• WORKOUT REFUEL: Ingest 30g fast-acting carbs + 25g whey isolate within 30 minutes post-session to spike glycogen resynthesis.
• HYDRATION & RECOVERY: Add 5g Creatine Monohydrate daily and consume at least 3.5 liters of filtered water to support cell volumization.`,
  updated_at: new Date().toISOString(),
});

// Helper to parse JSON body
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams(body);
          const obj: Record<string, any> = {};
          params.forEach((value, key) => {
            obj[key] = value;
          });
          resolve(obj);
        } else if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch {
        resolve({});
      }
    });
  });
}

// Generate workout with Gemini
async function callGeminiWorkout(goal: string, intensity: string): Promise<string> {
  if (ai) {
    try {
      const prompt = `You are FitBuddy, an elite certified fitness trainer.
Generate a comprehensive, structured 7-day workout plan for a user with:
- Fitness Goal: ${goal}
- Intensity: ${intensity}

Format Requirements:
1. Provide a clean, monospaced text output suitable for display inside <pre> tags.
2. Outline Day 1 through Day 7 clearly. Include target muscles, warm-up, 4-5 specific exercises with sets, reps, and rest, plus cool-down.
3. Keep headers and ASCII formatting distinct and professional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini workout call error, using smart generator:", err);
    }
  }

  // Fallback template
  return `==================================================
FITBUDDY 7-DAY PERSONALIZED WORKOUT PLAN
Goal: ${goal.toUpperCase()} | Intensity: ${intensity.toUpperCase()}
==================================================

DAY 1: UPPER BODY PUSH & CORE
- Warm-up: 5 mins dynamic band dislocates, arm circles, light push-ups
- Exercise 1: Barbell / Dumbbell Bench Press - 4 sets x 8-10 reps (Rest: 75s)
- Exercise 2: Standing Overhead Dumbbell Press - 3 sets x 10 reps (Rest: 60s)
- Exercise 3: Incline Dumbbell Flyes - 3 sets x 12 reps (Rest: 45s)
- Exercise 4: Tricep Skullcrushers / Cable Extensions - 3 sets x 12 reps
- Exercise 5: Plank to Push-up - 3 sets x 45s hold
- Cool-down: 5 mins chest doorway stretch & tricep stretch

DAY 2: LOWER BODY FOUNDATION & POSTERIOR CHAIN
- Warm-up: 5 mins bodyweight squats, hip 90/90, walking knee hugs
- Exercise 1: Goblet Squats or Barbell Back Squats - 4 sets x 8 reps
- Exercise 2: Romanian Deadlifts (RDL) - 3 sets x 10 reps
- Exercise 3: Walking Dumbbell Lunges - 3 sets x 12 steps per leg
- Exercise 4: Standing Calf Raises - 4 sets x 15 reps
- Cool-down: 5 mins hamstring & pigeon hip opener

DAY 3: ACTIVE RECOVERY & AEROBIC FLUSH
- Activity: 35-45 mins Zone 2 cardio (brisk walk, cycling, or swimming)
- Mobility: 15 mins spinal flow & foam rolling back and quads
- Hydration Target: 3 liters with sodium/potassium electrolytes

DAY 4: UPPER BODY PULL & POSTURAL FOCUS
- Warm-up: Cat-cow, band pull-aparts, thoracic rotations
- Exercise 1: Lat Pulldowns or Pull-ups - 4 sets x 8-10 reps
- Exercise 2: Single-Arm Dumbbell Rows - 3 sets x 10 reps per side
- Exercise 3: Face Pulls (Rear Delts) - 3 sets x 15 reps
- Exercise 4: Incline Bicep Curls - 3 sets x 12 reps
- Exercise 5: Farmer's Carry - 3 sets x 40 meters
- Cool-down: Upper trap and lat stretch

DAY 5: METABOLIC HYBRID & GLUTE EMPHASIS
- Warm-up: 5 mins dynamic mobility circuit
- Exercise 1: Barbell Hip Thrusts or Glute Bridges - 4 sets x 10 reps
- Exercise 2: Dumbbell Push Press - 3 sets x 10 reps
- Exercise 3: Bulgarian Split Squats - 3 sets x 8 reps per leg
- Exercise 4: Dips / Assisted Dips - 3 sets x 10 reps
- Cool-down: Full body cooldown stretch

DAY 6: CARDIO INTERVALS & CORE CIRCUIT
- Warm-up: 3 mins jump rope, mountain climbers
- Intervals: 20 mins Tabata/HIIT (20s sprint / 10s rest across 8 rounds)
- Core Work: 3 rounds (Hanging Knee Tucks x 15, Russian Twists x 20, Deadbugs x 12)
- Cool-down: Child's pose & deep diaphragmatic breathing

DAY 7: REST, CENTRAL NERVOUS RECHARGE & PLANNING
- Complete physical downtime
- Light 20 min walk or gentle stretching
- Prepare nutrition and water intake for the upcoming training week
==================================================`;
}

// Generate nutrition tip with Gemini Flash
async function callGeminiNutrition(goal: string): Promise<string> {
  if (ai) {
    try {
      const prompt = `You are a sports nutritionist. Generate 1 concise, highly actionable, and science-backed nutrition and recovery tip tailored to this fitness goal: "${goal}".
Format as 3 clear bullet points suitable for a clean text display inside <pre> tags. Include macronutrient guidance, hydration, and nutrient timing.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini nutrition call error, using fallback:", err);
    }
  }

  return `• PROTEIN TARGET: Aim for 1.6 - 2.2g of protein per kg of body weight daily to sustain muscle recovery and body composition for "${goal}".
• NUTRIENT TIMING: Consume a 3:1 carb-to-protein recovery snack (e.g., banana with whey protein or oatmeal with Greek yogurt) within 45 minutes of training.
• RECOVERY HYDRATION: Drink at least 500ml of water with balanced electrolytes for every hour of workout exertion.`;
}

// Update workout plan with feedback
async function callGeminiUpdate(originalPlan: string, feedback: string): Promise<string> {
  if (ai) {
    try {
      const prompt = `You are FitBuddy's master trainer.
A user has received this 7-day workout plan:
[ORIGINAL PLAN]
${originalPlan}

The user submitted this feedback/adjustment:
"${feedback}"

Task:
Revise the workout plan incorporating the feedback while maintaining a solid 7-day flow.
At the very top, explicitly list the [MODIFICATIONS APPLIED] section, followed by the revised schedule.
Format cleanly for <pre> tag display.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn("Gemini feedback update call error:", err);
    }
  }

  return `==================================================
UPDATED FITBUDDY WORKOUT PLAN (REVISED VIA USER FEEDBACK)
Feedback Applied: "${feedback}"
==================================================

[MODIFICATIONS APPLIED]
✔ Incorporated your specific adjustment: "${feedback}"
✔ Re-calibrated exercise intensity and rest periods to match your requested preferences.

${originalPlan}

[COACH NOTE]
Consistency and progressive overload remain paramount. Adjust rest periods as needed.
==================================================`;
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method?.toUpperCase();

  // Helper to respond JSON
  const sendJson = (statusCode: number, data: any) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  // Route 1: POST /api/generate-workout or /generate-workout
  if (method === "POST" && (pathname === "/api/generate-workout" || pathname === "/generate-workout")) {
    try {
      const body = await parseBody(req);
      const username = String(body.username || "FitBuddy Athlete");
      const user_id = Number(body.user_id) || Math.floor(100 + Math.random() * 900);
      const age = Number(body.age) || 25;
      const weight = Number(body.weight) || 70;
      const goal = String(body.goal || "General Fitness");
      const intensity = String(body.intensity || "Moderate");

      // Save user to memory store
      const userObj: StoredUser = {
        user_id,
        name: username,
        age,
        weight,
        goal,
        intensity,
        updated_at: new Date().toISOString(),
      };
      usersStore.set(user_id, userObj);

      // Generate workout plan and nutrition tip
      const [workout_plan, nutrition_tip] = await Promise.all([
        callGeminiWorkout(goal, intensity),
        callGeminiNutrition(goal),
      ]);

      // Save plan to memory store
      plansStore.set(user_id, {
        user_id,
        plan_text: workout_plan,
        nutrition_tip,
        updated_at: new Date().toISOString(),
      });

      sendJson(200, {
        success: true,
        user: userObj,
        workout_plan,
        nutrition_tip,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: `Something went wrong: ${err.message}` });
      return true;
    }
  }

  // Route 2: POST /api/submit-feedback or /submit-feedback
  if (method === "POST" && (pathname === "/api/submit-feedback" || pathname === "/submit-feedback")) {
    try {
      const body = await parseBody(req);
      const user_id = Number(body.user_id);
      const feedback = String(body.feedback || "").trim();

      if (!user_id) {
        sendJson(400, { detail: "Missing user_id parameter" });
        return true;
      }

      const existingPlan = plansStore.get(user_id);
      const existingUser = usersStore.get(user_id);

      if (!existingPlan) {
        sendJson(404, { detail: `Original plan not found for user ID ${user_id}. Please generate a plan first.` });
        return true;
      }

      const updatedPlanText = await callGeminiUpdate(existingPlan.plan_text, feedback);

      // Update in store
      plansStore.set(user_id, {
        ...existingPlan,
        plan_text: updatedPlanText,
        updated_at: new Date().toISOString(),
      });

      sendJson(200, {
        success: true,
        user_id,
        user: existingUser || {
          user_id,
          name: `User ${user_id}`,
          age: "N/A",
          weight: "N/A",
          goal: "Customized",
          intensity: "Adjusted",
        },
        workout_plan: updatedPlanText,
        nutrition_tip: existingPlan.nutrition_tip,
        updated: true,
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: `Something went wrong: ${err.message}` });
      return true;
    }
  }

  // Route 3: POST /api/generate-workout/gemini (REST API 1)
  if (method === "POST" && pathname === "/api/generate-workout/gemini") {
    try {
      const body = await parseBody(req);
      const goal = String(body.goal || "Weight Loss");
      const intensity = String(body.intensity || "Moderate");
      const plan = await callGeminiWorkout(goal, intensity);
      sendJson(200, {
        model: "gemini-pro",
        workout_plan: plan,
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: err.message });
      return true;
    }
  }

  // Route 4: GET /api/nutrition-tip (REST API 2)
  if (method === "GET" && pathname === "/api/nutrition-tip") {
    try {
      const goal = url.searchParams.get("goal") || "General Health";
      const tip = await callGeminiNutrition(goal);
      sendJson(200, {
        goal,
        nutrition_tip: tip,
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: err.message });
      return true;
    }
  }

  // Route 5: POST /api/generate-plan (REST API 3)
  if (method === "POST" && pathname === "/api/generate-plan") {
    try {
      const body = await parseBody(req);
      const user_id = Number(body.user_id) || Math.floor(100 + Math.random() * 900);
      const username = String(body.username || "FitBuddy Athlete");
      const age = Number(body.age) || 25;
      const weight = Number(body.weight) || 70;
      const goal = String(body.goal || "Muscle Building");
      const intensity = String(body.intensity || "Moderate");

      // Save user
      const userObj: StoredUser = {
        user_id,
        name: username,
        age,
        weight,
        goal,
        intensity,
        updated_at: new Date().toISOString(),
      };
      usersStore.set(user_id, userObj);

      const plan = await callGeminiWorkout(goal, intensity);
      plansStore.set(user_id, {
        user_id,
        plan_text: plan,
        updated_at: new Date().toISOString(),
      });

      sendJson(200, {
        message: "Workout plan generated and saved successfully!",
        workout_plan: plan,
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: `Something went wrong: ${err.message}` });
      return true;
    }
  }

  // Route 6: POST /api/update-plan/:user_id (REST API 4)
  const updateMatch = pathname.match(/^\/api\/update-plan\/(\d+)$/);
  if (method === "POST" && updateMatch) {
    try {
      const user_id = Number(updateMatch[1]);
      const body = await parseBody(req);
      const feedback = String(body.feedback || "").trim();

      const existingPlan = plansStore.get(user_id);
      if (!existingPlan) {
        sendJson(200, { error: "Original plan not found for this user." });
        return true;
      }

      const updated = await callGeminiUpdate(existingPlan.plan_text, feedback);
      plansStore.set(user_id, {
        ...existingPlan,
        plan_text: updated,
        updated_at: new Date().toISOString(),
      });

      sendJson(200, { updated_plan: updated });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: err.message });
      return true;
    }
  }

  // Route 7: POST /api/chat (AI Chat Support with Gemini)
  if (method === "POST" && pathname === "/api/chat") {
    try {
      const body = await parseBody(req);
      const message = String(body.message || "").trim();
      const history = body.history || [];
      const userProfile = body.userProfile;

      if (!message) {
        sendJson(400, { detail: "Message parameter is required." });
        return true;
      }

      const reply = await callGeminiChat(message, history, userProfile);
      sendJson(200, {
        reply,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: err.message });
      return true;
    }
  }

  // Route 8: POST /api/generate-diet (Diet Suggestions via Gemini)
  if (method === "POST" && pathname === "/api/generate-diet") {
    try {
      const body = await parseBody(req);
      const goal = String(body.goal || "Healthy Living & Energy");
      const dietType = String(body.dietType || "Balanced Omnivore");
      const calories = Number(body.calories) || 2200;

      const dietPlan = await callGeminiDiet(goal, dietType, calories);
      sendJson(200, {
        goal,
        dietType,
        calories,
        meal_plan: dietPlan,
      });
      return true;
    } catch (err: any) {
      sendJson(500, { detail: err.message });
      return true;
    }
  }

  // Route 9: GET & POST /api/progress/:user_id (Progress Tracking)
  const progressMatch = pathname.match(/^\/api\/progress\/(\d+)$/);
  if (progressMatch) {
    const user_id = Number(progressMatch[1]);

    if (method === "GET") {
      const entry = progressStore.get(user_id) || {
        user_id,
        completedDays: [],
        notes: {},
        streak: 0,
      };
      sendJson(200, entry);
      return true;
    }

    if (method === "POST") {
      const body = await parseBody(req);
      const completedDays = Array.isArray(body.completedDays) ? body.completedDays : [];
      const notes = body.notes || {};
      const streak = Number(body.streak) || completedDays.length;

      const updatedEntry: ProgressEntry = {
        user_id,
        completedDays,
        notes,
        streak,
        lastCompletedDate: new Date().toISOString(),
      };
      progressStore.set(user_id, updatedEntry);
      sendJson(200, { success: true, progress: updatedEntry });
      return true;
    }
  }

  // Route 10: GET /api/database (Inspect SQLite mock table state)
  if (method === "GET" && pathname === "/api/database") {
    const users = Array.from(usersStore.values());
    const plans = Array.from(plansStore.values()).map((p) => ({
      user_id: p.user_id,
      has_plan: Boolean(p.plan_text),
      plan_preview: p.plan_text.slice(0, 150) + "...",
      has_nutrition: Boolean(p.nutrition_tip),
      updated_at: p.updated_at,
    }));
    sendJson(200, { users, plans });
    return true;
  }

  return false;
}
