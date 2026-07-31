from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware # Import do CORS
from app.controllers.health_controller import router as health_router
from app.controllers.profile_controller import router as profile_router
from app.core.exceptions import AuthError, auth_error_handler # Import do Handler de erro
from app.controllers.auth_controller import router as auth_router


frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")
app = FastAPI(
    title="Portal MSC API",
    description="API do portal de notícias com arquitetura MSC",
    version="0.1.0"
)

# 1. Configuração do CORS (Obrigatório para o React/Vite conectar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Inclusão das Rotas
app.include_router(health_router)
app.include_router(profile_router)
app.include_router(auth_router)
# 3. Registro do Handler de Erros de Autenticação (Para o JWT retornar 401 em vez de 500)
app.add_exception_handler(AuthError, auth_error_handler)

@app.get("/")
async def root():
    return {"message": "Portal MSC API rodando!", "docs": "/docs"}