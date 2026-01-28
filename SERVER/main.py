from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from routers import auth, users, nominees, medications, emergency

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"
    ],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(nominees.router)
app.include_router(medications.router)
app.include_router(emergency.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Lumi API"}
