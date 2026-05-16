from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import meal_plan, shopping_list, community
from app.services.gemini_service import check_gemini_health
from app.services import budget_service
from app import state

app = FastAPI(title="献立立案システム API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kondate-planning-system.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meal_plan.router)
app.include_router(shopping_list.router)
app.include_router(community.router)


@app.get("/api/health")
async def health():
    gemini_status = check_gemini_health()
    return {"status": "ok", "gemini": gemini_status}


@app.get("/api/usage")
async def usage():
    remaining = budget_service.get_remaining()
    return {"remaining": remaining, "total": state.DAILY_API_LIMIT}
