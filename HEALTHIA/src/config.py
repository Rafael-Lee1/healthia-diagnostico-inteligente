from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

DISEASE_CATALOG_PATH = DATA_DIR / "disease_catalog.json"
DATASET_PATH = DATA_DIR / "symptom_cases.csv"
MODEL_PATH = MODELS_DIR / "healthia_pipeline.joblib"
METRICS_PATH = MODELS_DIR / "evaluation_metrics.json"
TRAINING_SUMMARY_PATH = MODELS_DIR / "training_summary.md"

DEFAULT_TOP_N = 5
MIN_CONFIDENCE = 0.18
MIN_NONZERO_FEATURES = 2
