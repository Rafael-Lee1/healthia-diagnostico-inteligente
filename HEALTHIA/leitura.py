from src.training.dataset_generator import save_dataset
from src.training.train import train_and_save_model


def rebuild_project_assets() -> dict:
    save_dataset()
    return train_and_save_model(force_regenerate_dataset=False)


if __name__ == "__main__":
    metrics = rebuild_project_assets()
    print(
        f"Modelo treinado com accuracy={metrics['accuracy']} "
        f"e macro_f1={metrics['f1_macro']}"
    )
