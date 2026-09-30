import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes import router

app = FastAPI(
    title="FitBuddy - AI Workout Planner",
    description="Activity 2.2 FastAPI Backend to Manage Routing, User Input Processing, and Gemini Integration",
    version="1.0.0"
)

# Include core routes
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
