import hashlib
import json
import os
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(
    title="TraceMind AI API",
    description="AI-Powered Digital Forensic Investigation Platform",
    version="0.1.0",
)

# CORS Middleware for local forensic development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
  """System health status and operational state."""
  return {
      "status": "healthy",
      "service": "TraceMind AI Forensic API",
      "timestamp": datetime.utcnow().isoformat() + "Z",
      "version": "0.1.0",
      "active_case": "TF-2026-1010",
  }


@app.get("/api/cases")
def list_cases():
  """List active forensic cases."""
  cases_path = os.path.join(DATA_DIR, "cases.json")
  if os.path.exists(cases_path):
    try:
      with open(cases_path, "r", encoding="utf-8") as f:
        return json.load(f)
    except Exception:
      pass
  return [{
      "id": "TF-2026-1010",
      "title": "Perimeter Breach & Sensor Correlation",
      "status": "Active Investigation",
      "investigator": "Biswarupa Swain",
      "created": "10 Oct 2026, 03:25",
  }]


@app.get("/api/evidence")
def list_evidence():
  """List collected evidence items."""
  evidence_path = os.path.join(DATA_DIR, "evidence.json")
  if os.path.exists(evidence_path):
    try:
      with open(evidence_path, "r", encoding="utf-8") as f:
        return json.load(f)
    except Exception:
      pass
  return []


@app.post("/api/evidence/upload")
async def upload_evidence(file: UploadFile = File(...)):
  """Ingest evidence file, compute cryptographic hash, and record in custody log."""
  contents = await file.read()
  sha256_hash = hashlib.sha256(contents).hexdigest()

  # Save to uploads directory
  safe_filename = os.path.basename(file.filename)
  file_path = os.path.join(UPLOADS_DIR, safe_filename)
  with open(file_path, "wb") as f:
    f.write(contents)

  record = {
      "id": f"ev-{int(datetime.utcnow().timestamp())}",
      "filename": safe_filename,
      "size_bytes": len(contents),
      "content_type": file.content_type,
      "sha256": sha256_hash,
      "uploaded_at": datetime.utcnow().isoformat() + "Z",
      "status": "Verified Intact",
  }

  # Append to evidence.json
  evidence_path = os.path.join(DATA_DIR, "evidence.json")
  items = []
  if os.path.exists(evidence_path):
    try:
      with open(evidence_path, "r", encoding="utf-8") as f:
        items = json.load(f)
    except Exception:
      items = []

  items.append(record)
  with open(evidence_path, "w", encoding="utf-8") as f:
    json.dump(items, f, indent=2)

  return record


# Mount frontend static directory if exists
if os.path.exists(FRONTEND_DIR):
  app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
