from fastapi import FastAPI
from app.controllers.health_controller import router as health_router
from app.controllers.profile_controller import router as profile_router


app = FastAPI(
    title="Portal MSC API",
    description="API do portal de notícias com arquitetura MSC",
    version="0.1.0"
)

app.include_router(health_router)
app.include_router(profile_router)

@app.get("/")
async def root():
    return {"message": "Portal MSC API rodando!", "docs": "/docs"}
