from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Literal

import joblib
import numpy as np

from src.config import DEFAULT_TOP_N, MIN_CONFIDENCE, MIN_NONZERO_FEATURES, MODEL_PATH
from src.data_loading import load_catalog
from src.preprocessing.text import SymptomTextPreprocessor, is_meaningful_input


DISCLAIMER = (
    "Projeto educacional. Esta ferramenta sugere hipóteses de estudo e não substitui "
    "avaliação médica profissional."
)

LOW_CONFIDENCE_MESSAGE = "Informações insuficientes para sugestão confiável"


@dataclass
class PatientContext:
    age: int | None = None
    sex: Literal["male", "female", "other", "unknown"] | None = None
    pregnant: bool | None = None
    comorbidities: list[str] | None = None
    medications: list[str] | None = None
    recent_conditions: list[str] | None = None
    recent_surgeries: bool | None = None
    lifestyle_notes: str | None = None

    def is_empty(self) -> bool:
        return not any(
            [
                self.age is not None,
                self.sex not in (None, "", "unknown"),
                self.pregnant is not None,
                self.comorbidities,
                self.medications,
                self.recent_conditions,
                self.recent_surgeries is not None,
                bool((self.lifestyle_notes or "").strip()),
            ]
        )

    def to_public_dict(self) -> dict | None:
        if self.is_empty():
            return None

        return {
            key: value
            for key, value in asdict(self).items()
            if value not in (None, "", []) and not (key == "sex" and value == "unknown")
        }


@dataclass
class PredictionResult:
    input_text: str
    normalized_text: str
    predictions: list[dict]
    warning: str | None
    disclaimer: str
    patient_context: dict | None = None
    top_diagnosis_explanation: str | None = None


class HealthIAPredictor:
    def __init__(self, model_path=MODEL_PATH) -> None:
        if not model_path.exists():
            from src.training.train import train_and_save_model

            train_and_save_model(force_regenerate_dataset=True)
        artifact = joblib.load(model_path)
        self.pipeline = artifact["pipeline"]
        self.label_encoder = artifact["label_encoder"]
        self.normalizer = SymptomTextPreprocessor()
        self.catalog_by_slug = {item["slug"]: item for item in load_catalog()}

    def predict(
        self,
        text: str,
        top_n: int = DEFAULT_TOP_N,
        patient_context: PatientContext | None = None,
    ) -> PredictionResult:
        cleaned_input = (text or "").strip()
        normalized_context = self._normalize_context(patient_context)
        model_input = self._compose_model_input(cleaned_input, normalized_context)
        normalized_text = self.normalizer.normalize_text(model_input)

        if not cleaned_input or not is_meaningful_input(cleaned_input):
            return PredictionResult(
                input_text=cleaned_input,
                normalized_text=normalized_text,
                predictions=[],
                warning=LOW_CONFIDENCE_MESSAGE,
                disclaimer=DISCLAIMER,
                patient_context=normalized_context.to_public_dict() if normalized_context else None,
            )

        features = self.pipeline.named_steps["features"].transform(
            self.pipeline.named_steps["normalize"].transform([model_input])
        )
        nonzero_features = int(features.nnz)

        probabilities = self.pipeline.predict_proba([model_input])[0]
        top_indices = np.argsort(probabilities)[::-1][:top_n]
        predictions = [
            {
                "disease": self.label_encoder.inverse_transform([index])[0],
                "confidence": round(float(probabilities[index]), 4),
            }
            for index in top_indices
        ]
        for item in predictions:
            metadata = self.catalog_by_slug.get(item["disease"], {})
            item["domain"] = metadata.get("domain")
            item["severity"] = metadata.get("severity")
            item["is_emergency"] = metadata.get("is_emergency")

        warning = None
        if not predictions or predictions[0]["confidence"] < MIN_CONFIDENCE or nonzero_features < MIN_NONZERO_FEATURES:
            warning = LOW_CONFIDENCE_MESSAGE
            predictions = []
        elif predictions[0]["is_emergency"] and predictions[0]["confidence"] >= 0.6:
            warning = (
                "Foram encontradas hipóteses potencialmente urgentes. "
                "Procure avaliação profissional imediata se houver piora clínica."
            )

        explanation = None
        if predictions:
            explanation = self._build_top_explanation(
                disease_slug=predictions[0]["disease"],
                cleaned_input=cleaned_input,
                patient_context=normalized_context,
            )

        return PredictionResult(
            input_text=cleaned_input,
            normalized_text=normalized_text,
            predictions=predictions,
            warning=warning,
            disclaimer=DISCLAIMER,
            patient_context=normalized_context.to_public_dict() if normalized_context else None,
            top_diagnosis_explanation=explanation,
        )

    def _normalize_context(self, patient_context: PatientContext | None) -> PatientContext | None:
        if patient_context is None:
            return None

        context = PatientContext(
            age=patient_context.age,
            sex=patient_context.sex or None,
            pregnant=patient_context.pregnant,
            comorbidities=self._sanitize_string_list(patient_context.comorbidities),
            medications=self._sanitize_string_list(patient_context.medications),
            recent_conditions=self._sanitize_string_list(patient_context.recent_conditions),
            recent_surgeries=patient_context.recent_surgeries,
            lifestyle_notes=(patient_context.lifestyle_notes or "").strip() or None,
        )
        return None if context.is_empty() else context

    def _sanitize_string_list(self, values: list[str] | None) -> list[str]:
        if not values:
            return []
        seen = set()
        normalized_values = []
        for value in values:
            cleaned = (value or "").strip()
            normalized_key = cleaned.lower()
            if not cleaned or normalized_key in seen:
                continue
            seen.add(normalized_key)
            normalized_values.append(cleaned)
        return normalized_values

    def _compose_model_input(self, text: str, patient_context: PatientContext | None) -> str:
        if not patient_context:
            return text

        segments: list[str] = []
        if patient_context.age is not None:
            segments.append(f"idade {patient_context.age} anos")
            segments.append(f"faixa {self._age_bucket(patient_context.age)}")
        sex_label = {
            "male": "sexo masculino",
            "female": "sexo feminino",
            "other": "sexo outro",
        }.get(patient_context.sex or "", "")
        if sex_label:
            segments.append(sex_label)
        if patient_context.pregnant is True:
            segments.append("gestante gravidez atual")
        elif patient_context.pregnant is False:
            segments.append("nao gestante")
        if patient_context.comorbidities:
            segments.append(f"comorbidades {' '.join(patient_context.comorbidities)}")
        if patient_context.medications:
            segments.append(f"medicacoes em uso {' '.join(patient_context.medications)}")
        if patient_context.recent_conditions:
            segments.append(f"condicoes recentes {' '.join(patient_context.recent_conditions)}")
        if patient_context.recent_surgeries is True:
            segments.append("cirurgia recente tratamento recente")
        if patient_context.lifestyle_notes:
            segments.append(f"estilo de vida {patient_context.lifestyle_notes}")

        context_text = ". ".join(segment for segment in segments if segment).strip()
        return text if not context_text else f"{text}. contexto paciente {context_text}"

    def _age_bucket(self, age: int) -> str:
        if age < 12:
            return "crianca"
        if age < 18:
            return "adolescente"
        if age < 60:
            return "adulto"
        return "idoso"

    def _build_top_explanation(
        self,
        disease_slug: str,
        cleaned_input: str,
        patient_context: PatientContext | None,
    ) -> str | None:
        metadata = self.catalog_by_slug.get(disease_slug, {})
        if not metadata:
            return None

        normalized_input = self.normalizer.normalize_text(cleaned_input)
        input_tokens = set(normalized_input.split())

        symptom_evidence = self._matched_terms(
            input_tokens,
            (metadata.get("core_symptoms") or []) + (metadata.get("supporting_symptoms") or []),
        )[:3]
        context_evidence = self._context_evidence(patient_context, metadata)[:2]

        fragments = []
        if symptom_evidence:
            fragments.append(
                "pela presença de "
                + ", ".join(self._humanize_term(term) for term in symptom_evidence[:-1])
                + (f" e {self._humanize_term(symptom_evidence[-1])}" if len(symptom_evidence) > 1 else self._humanize_term(symptom_evidence[0]))
            )
        if context_evidence:
            fragments.append("considerando " + ", ".join(context_evidence))

        if not fragments:
            return f"Sugestão educacional alinhada ao padrão sintomático mais compatível com {self._humanize_term(disease_slug)}."

        joined = " e ".join(fragments)
        return f"Sugerido {joined}, padrão frequentemente associado a {self._humanize_term(disease_slug)}."

    def _matched_terms(self, input_tokens: set[str], terms: list[str]) -> list[str]:
        matches = []
        for term in terms:
            normalized = self.normalizer.normalize_text(str(term))
            tokens = [token for token in normalized.split() if token]
            if tokens and all(token in input_tokens for token in tokens):
                matches.append(str(term))
        return matches

    def _context_evidence(self, patient_context: PatientContext | None, metadata: dict) -> list[str]:
        if not patient_context:
            return []

        evidence = []
        if patient_context.age is not None:
            evidence.append(f"a faixa etária informada ({patient_context.age} anos)")
        if patient_context.pregnant:
            evidence.append("o contexto de gestação informado")
        if patient_context.comorbidities:
            evidence.append("as comorbidades relatadas")
        if patient_context.recent_conditions:
            clues = self._matched_terms(
                set(self.normalizer.normalize_text(" ".join(patient_context.recent_conditions)).split()),
                metadata.get("context_clues") or [],
            )
            evidence.append("as condições recentes mencionadas" if not clues else f"o contexto recente de {self._humanize_term(clues[0])}")
        elif patient_context.lifestyle_notes:
            evidence.append("o histórico adicional informado")
        return evidence

    def _humanize_term(self, value: str) -> str:
        return str(value).replace("_", " ")
