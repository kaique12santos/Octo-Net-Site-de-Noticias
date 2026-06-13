from fastapi import FastAPI
from app.controllers.health_controller import router as health_router
from app.controllers.user_controller import router as user_router
from app.controllers.news_controller import router as news_router
from app.database.connection import engine, Base


app = FastAPI(
    title="Portal MSC API",
    description="API do portal de notícias com arquitetura MSC",
    version="0.1.0"
)

app.include_router(health_router)
app.include_router(user_router)
app.include_router(news_router)


@app.get("/")
async def root():
    return {"message": "Portal MSC API rodando!", "docs": "/docs"}
