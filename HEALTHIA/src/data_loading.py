from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from src.config import DATASET_PATH, DISEASE_CATALOG_PATH


REQUIRED_COLUMNS = [
    "case_id",
    "split_group",
    "disease",
    "domain",
    "severity",
    "is_emergency",
    "age_group",
    "sex_profile",
    "symptoms_text",
]


def load_catalog(path: Path = DISEASE_CATALOG_PATH) -> list[dict]:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_dataset(path: Path = DATASET_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
    if missing:
        raise ValueError(f"Dataset missing required columns: {missing}")
    return df.drop_duplicates(subset=["symptoms_text", "disease"]).reset_index(drop=True)
