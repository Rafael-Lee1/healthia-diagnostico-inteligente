from __future__ import annotations

import random
from itertools import cycle

import pandas as pd

from src.config import DATASET_PATH
from src.data_loading import load_catalog


CONNECTORS = [
    "e",
    "além disso",
    "junto com",
    "também",
    "principalmente",
]

INTENSIFIERS = ["leve", "moderada", "forte", "intensa", "persistente"]
TIME_EXPRESSIONS = [
    "desde ontem",
    "há 2 dias",
    "desde a semana passada",
    "de forma súbita",
    "de forma gradual",
    "há algumas horas",
]
AGE_GROUPS = ["adulto", "idoso", "adolescente"]
SEX_PROFILES = ["indiferente", "masculino", "feminino"]


def _sample_unique(sequence: list[str], minimum: int, maximum: int, rng: random.Random) -> list[str]:
    size = rng.randint(minimum, min(maximum, len(sequence)))
    return rng.sample(sequence, size)


def _render_case(disease: dict, rng: random.Random, case_index: int) -> dict:
    primary = _sample_unique(disease["core_symptoms"], 2, min(4, len(disease["core_symptoms"])), rng)
    secondary = _sample_unique(disease["supporting_symptoms"], 1, min(3, len(disease["supporting_symptoms"])), rng)
    symptom_pool = primary + secondary
    rng.shuffle(symptom_pool)

    intro = rng.choice(disease["openers"])
    connector = rng.choice(CONNECTORS)
    duration = rng.choice(TIME_EXPRESSIONS)
    intensity = rng.choice(INTENSIFIERS)

    if rng.random() < 0.35 and disease.get("context_clues"):
        context = rng.choice(disease["context_clues"])
        text = f"{intro} {intensity} {symptom_pool[0]}, {connector} {', '.join(symptom_pool[1:])}, {context}, {duration}"
    else:
        text = f"{intro} {intensity} {symptom_pool[0]}, {connector} {', '.join(symptom_pool[1:])}, {duration}"

    if rng.random() < 0.20 and disease.get("exclude_symptoms"):
        text = f"{text}, sem {rng.choice(disease['exclude_symptoms'])}"

    return {
        "case_id": f"{disease['slug']}-{case_index:04d}",
        "split_group": disease["slug"],
        "disease": disease["slug"],
        "domain": disease["domain"],
        "severity": disease["severity"],
        "is_emergency": disease["is_emergency"],
        "age_group": rng.choice(AGE_GROUPS),
        "sex_profile": rng.choice(SEX_PROFILES),
        "symptoms_text": text,
    }


def generate_dataset(samples_per_disease: int = 60, seed: int = 42) -> pd.DataFrame:
    rng = random.Random(seed)
    diseases = load_catalog()
    rows: list[dict] = []

    for disease in diseases:
        seen_texts = set()
        case_index = 1
        while len(seen_texts) < samples_per_disease:
            row = _render_case(disease, rng, case_index)
            case_index += 1
            if row["symptoms_text"] in seen_texts:
                continue
            seen_texts.add(row["symptoms_text"])
            rows.append(row)

    df = pd.DataFrame(rows)
    return df.sample(frac=1.0, random_state=seed).reset_index(drop=True)


def save_dataset(samples_per_disease: int = 60, seed: int = 42) -> pd.DataFrame:
    df = generate_dataset(samples_per_disease=samples_per_disease, seed=seed)
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATASET_PATH, index=False)
    return df


if __name__ == "__main__":
    save_dataset()
