from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from jose import ExpiredSignatureError, JWTError

from app.db.setup import init_db
from app.routers import auth, github, bookmarks
from app.middleware.auth_middleware import auth_http_middleware
from app.core.config import settings

@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup
    await init_db()
    print("DB initialized!")

    yield  # Application runs here

    # Shutdown
    print("Shutting down...")

app = FastAPI(lifespan=lifespan, title="GitHub Task")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Adding routers to the app
app.include_router(auth.router)
app.include_router(github.router)
app.include_router(bookmarks.router)
# Added Middleware
app.middleware("http")(auth_http_middleware)
