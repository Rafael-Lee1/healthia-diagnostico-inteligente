from __future__ import annotations

import json

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.preprocessing import LabelEncoder

from src.config import DATASET_PATH, METRICS_PATH, MODEL_PATH, TRAINING_SUMMARY_PATH
from src.data_loading import load_dataset
from src.preprocessing.text import SymptomTextPreprocessor
from src.training.dataset_generator import save_dataset


def build_pipeline() -> Pipeline:
    word_features = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.92,
        sublinear_tf=True,
        strip_accents="unicode",
    )
    char_features = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        min_df=2,
        sublinear_tf=True,
        strip_accents="unicode",
    )

    return Pipeline(
        steps=[
            ("normalize", SymptomTextPreprocessor()),
            ("features", FeatureUnion([
                ("word_tfidf", word_features),
                ("char_tfidf", char_features),
            ])),
            ("select", SelectKBest(score_func=chi2, k=1500)),
            ("classifier", LogisticRegression(
                max_iter=2000,
                solver="lbfgs",
                class_weight="balanced",
            )),
        ]
    )


def evaluate_pipeline(pipeline: Pipeline, X_train, y_train, X_test, y_test, class_names: list[str]) -> dict:
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_validate(
        pipeline,
        X_train,
        y_train,
        cv=skf,
        scoring=["accuracy", "f1_macro"],
        n_jobs=None,
    )

    metrics = {
        "dataset_path": str(DATASET_PATH),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "num_classes": int(len(class_names)),
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "precision_macro": round(float(precision_score(y_test, predictions, average="macro", zero_division=0)), 4),
        "recall_macro": round(float(recall_score(y_test, predictions, average="macro", zero_division=0)), 4),
        "f1_macro": round(float(f1_score(y_test, predictions, average="macro", zero_division=0)), 4),
        "cv_accuracy_mean": round(float(np.mean(cv_scores["test_accuracy"])), 4),
        "cv_accuracy_std": round(float(np.std(cv_scores["test_accuracy"])), 4),
        "cv_f1_macro_mean": round(float(np.mean(cv_scores["test_f1_macro"])), 4),
        "top1_mean_confidence": round(float(np.mean(np.max(probabilities, axis=1))), 4),
        "classification_report": classification_report(
            y_test,
            predictions,
            target_names=class_names,
            output_dict=True,
            zero_division=0,
        ),
        "confusion_matrix": confusion_matrix(y_test, predictions).tolist(),
    }
    return metrics


def save_training_summary(metrics: dict) -> None:
    lines = [
        "# HealthIA Training Summary",
        "",
        f"- Accuracy: {metrics['accuracy']}",
        f"- Macro F1: {metrics['f1_macro']}",
        f"- Macro Precision: {metrics['precision_macro']}",
        f"- Macro Recall: {metrics['recall_macro']}",
        f"- CV Accuracy Mean: {metrics['cv_accuracy_mean']}",
        f"- CV Macro F1 Mean: {metrics['cv_f1_macro_mean']}",
        f"- Classes: {metrics['num_classes']}",
        f"- Train size: {metrics['train_size']}",
        f"- Test size: {metrics['test_size']}",
    ]
    TRAINING_SUMMARY_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def train_and_save_model(force_regenerate_dataset: bool = True) -> dict:
    if force_regenerate_dataset or not DATASET_PATH.exists():
        save_dataset()

    df = load_dataset()
    X = df["symptoms_text"]
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["disease"])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()
    metrics = evaluate_pipeline(
        pipeline=pipeline,
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
        class_names=label_encoder.classes_.tolist(),
    )

    artifact = {
        "pipeline": pipeline,
        "label_encoder": label_encoder,
        "class_names": label_encoder.classes_.tolist(),
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")
    save_training_summary(metrics)
    return metrics


if __name__ == "__main__":
    results = train_and_save_model(force_regenerate_dataset=True)
    print(json.dumps({
        "accuracy": results["accuracy"],
        "f1_macro": results["f1_macro"],
        "cv_accuracy_mean": results["cv_accuracy_mean"],
        "num_classes": results["num_classes"],
    }, ensure_ascii=False, indent=2))
