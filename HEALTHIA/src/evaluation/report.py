from __future__ import annotations

import json

from src.config import METRICS_PATH


def load_metrics() -> dict:
    with METRICS_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def format_metrics_summary() -> str:
    metrics = load_metrics()
    return (
        f"Accuracy: {metrics['accuracy']}\n"
        f"Macro F1: {metrics['f1_macro']}\n"
        f"Macro Precision: {metrics['precision_macro']}\n"
        f"Macro Recall: {metrics['recall_macro']}\n"
        f"CV Accuracy Mean: {metrics['cv_accuracy_mean']}\n"
        f"Classes: {metrics['num_classes']}"
    )
