"""
Placeholder risk predictor.
Replace with a real model (e.g. scikit-learn) as needed.
"""

def predict_risk(patient: dict) -> dict:
    """Return a simple rule-based risk score (0-100)."""
    condition = patient.get("condition", "Normal")
    scores = {"Critical": 90, "Stable": 50, "Normal": 20}
    score = scores.get(condition, 30)

    meds_pending = len([m for m in patient.get("medicines", []) if not m["done"]])
    score = min(100, score + meds_pending * 3)

    return {"patientId": patient["id"], "riskScore": score, "level": condition}
