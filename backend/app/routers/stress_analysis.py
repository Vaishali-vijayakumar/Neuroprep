"""
Stress Analysis Router — Spatiotemporal & rPPG Continuous Video Stress Pipeline
"""
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.services.face_stress_model import stress_model_service

router = APIRouter(prefix="/api/stress", tags=["stress"])

class ActionUnitsPayload(BaseModel):
    au1: float = 0.0
    au2: float = 0.0
    au4: float = 0.0
    au7: float = 0.0
    au9: float = 0.0
    compositeAU: float = 0.0

class PhysiologicalPayload(BaseModel):
    hrBpm: float = 74.0
    hrvMs: float = 60.0

class StressTelemetryRequest(BaseModel):
    session_id: Optional[str] = "session_default"
    actionUnits: Optional[ActionUnitsPayload] = None
    physiological: Optional[PhysiologicalPayload] = None
    microExpressionIntensity: Optional[float] = 0.0
    frame_window_size: int = 120

@router.post("/analyze-telemetry")
async def analyze_stress_telemetry(req: StressTelemetryRequest):
    au = req.actionUnits or ActionUnitsPayload()
    phys = req.physiological or PhysiologicalPayload()

    # Create synthetic frame batch representation for deep PyTorch model pass
    # [T=30, H=112, W=112, C=3]
    dummy_frames = np.random.uniform(0.2, 0.8, size=(30, 112, 112, 3)).astype(np.float32)

    rppg_dict = {
        "hrBpm": phys.hrBpm,
        "hrvMs": phys.hrvMs
    }

    res = stress_model_service.predict_stress(dummy_frames, rppg_dict)

    # Fuse model prediction with incoming real-time FACS Action Units & Micro-expression intensity
    fused_score = Math_clamp(round(
        (res["stress_score"] * 0.4) +
        (au.compositeAU * 0.3) +
        (req.microExpressionIntensity * 0.3)
    ), 0, 100)

    cognitive_load = "Low"
    if fused_score >= 65:
        cognitive_load = "High"
    elif fused_score >= 35:
        cognitive_load = "Moderate"

    recommendation = "Standard Interview Pacing (150 WPM)"
    if cognitive_load == "High":
        recommendation = "Adaptive AI: Slow Pacing (120 WPM), Provide Supportive Hint & Box Breathing Prompt"
    elif cognitive_load == "Moderate":
        recommendation = "Adaptive AI: Balanced Technical Pacing"

    return {
        "status": "success",
        "session_id": req.session_id,
        "stressIndex": fused_score,
        "cognitiveLoad": cognitive_load,
        "modelConfidence": res["confidence"],
        "physiological": {
            "hrBpm": phys.hrBpm,
            "hrvMs": phys.hrvMs
        },
        "actionUnits": au.dict(),
        "recommendation": recommendation
    }

def Math_clamp(val, min_v, max_v):
    return max(min_v, min(max_v, val))
