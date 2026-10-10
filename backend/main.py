from fastapi import FastAPI

app = FastAPI(
    title="TraceMind AI API",
    description="AI-Powered Digital Forensic Investigation Platform",
    version="0.1.0",
)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to TraceMind AI API",
        "status": "online",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
