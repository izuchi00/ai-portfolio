from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True
)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/analyze")
async def analyze(req: Request):
    payload = await req.json()
    values = payload.get("values", [])
    arr = np.array(values, dtype=float)
    return {"count": int(arr.size), "mean": float(arr.mean()) if arr.size else None}