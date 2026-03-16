import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.sintomasAPI import router as sintomas_router


app = FastAPI(
    title="HealthIA API",
    description="API educacional para sugestão de hipóteses de doenças com base em sintomas em texto livre.",
    version="2.0.0",
)

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

frontend_urls_env = os.getenv("FRONTEND_URLS", "").strip()
if frontend_urls_env:
    extra_origins = [url.strip().rstrip("/") for url in frontend_urls_env.split(",") if url.strip()]
    origins.extend(extra_origins)

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
if frontend_url:
    origins.append(frontend_url)

allow_all_origins = os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else sorted(set(origins)),
    allow_origin_regex=None if allow_all_origins else r"^https://.*\.up\.railway\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sintomas_router, tags=["Sintomas"])
