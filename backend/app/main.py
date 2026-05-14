from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import meal_plan, shopping_list
from app.services.gemini_service import check_gemini_health

app = FastAPI(title="献立立案システム API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meal_plan.router)
app.include_router(shopping_list.router)


@app.get("/api/health")
async def health():
    gemini_status = check_gemini_health()
    return {"status": "ok", "gemini": gemini_status}
