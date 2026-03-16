from typing import Literal

from pydantic import BaseModel, Field
from fastapi import APIRouter, Query

from src.inference.predictor import HealthIAPredictor, PatientContext


router = APIRouter()
predictor = HealthIAPredictor()


class PatientContextPayload(BaseModel):
    age: int | None = Field(default=None, ge=0, le=120)
    sex: Literal["male", "female", "other", "unknown"] | None = None
    pregnant: bool | None = None
    comorbidities: list[str] | None = None
    medications: list[str] | None = None
    recent_conditions: list[str] | None = None
    recent_surgeries: bool | None = None
    lifestyle_notes: str | None = None

    def to_domain(self) -> PatientContext:
        return PatientContext(
            age=self.age,
            sex=self.sex,
            pregnant=self.pregnant,
            comorbidities=self.comorbidities,
            medications=self.medications,
            recent_conditions=self.recent_conditions,
            recent_surgeries=self.recent_surgeries,
            lifestyle_notes=self.lifestyle_notes,
        )


class PredictionRequest(BaseModel):
    sintomas: str = Field(..., min_length=1, description="Descrição em texto livre dos sintomas.")
    top_n: int = Field(default=5, ge=1, le=5)
    patient_context: PatientContextPayload | None = None


def _parse_csv_field(value: str | None) -> list[str] | None:
    if not value:
        return None
    items = [item.strip() for item in value.split(",") if item.strip()]
    return items or None


def _build_response(result):
    return {
        "input_text": result.input_text,
        "normalized_text": result.normalized_text,
        "top_predictions": result.predictions,
        "warning": result.warning,
        "disclaimer": result.disclaimer,
        "patient_context": result.patient_context,
        "top_diagnosis_explanation": result.top_diagnosis_explanation,
    }


@router.get("/")
async def raiz():
    return {
        "message": "Welcome to HealthIA API",
        "mode": "educational",
    }


@router.get("/predict/")
async def predict_get(
    sintomas: str = Query(..., min_length=1),
    top_n: int = Query(default=5, ge=1, le=5),
    age: int | None = Query(default=None, ge=0, le=120),
    sex: Literal["male", "female", "other", "unknown"] | None = Query(default=None),
    pregnant: bool | None = Query(default=None),
    comorbidities: str | None = Query(default=None),
    medications: str | None = Query(default=None),
    recent_conditions: str | None = Query(default=None),
    recent_surgeries: bool | None = Query(default=None),
    lifestyle_notes: str | None = Query(default=None),
):
    patient_context = PatientContext(
        age=age,
        sex=sex,
        pregnant=pregnant,
        comorbidities=_parse_csv_field(comorbidities),
        medications=_parse_csv_field(medications),
        recent_conditions=_parse_csv_field(recent_conditions),
        recent_surgeries=recent_surgeries,
        lifestyle_notes=lifestyle_notes,
    )
    result = predictor.predict(sintomas, top_n=top_n, patient_context=patient_context)
    return _build_response(result)


@router.post("/predict/")
async def predict_post(payload: PredictionRequest):
    result = predictor.predict(
        payload.sintomas,
        top_n=payload.top_n,
        patient_context=payload.patient_context.to_domain() if payload.patient_context else None,
    )
    return _build_response(result)
