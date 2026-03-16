# HealthIA

HealthIA is an educational machine learning project for symptom-based disease hypothesis ranking in Portuguese. The system accepts free-text symptom descriptions, normalizes colloquial medical language, and returns a ranked Top-N list of likely conditions with confidence scores and safety-oriented fallback behavior.

This repository is intentionally positioned as a portfolio-grade ML engineering project, not a clinical device and not a substitute for professional care.

## Highlights

- Free-text symptom classification in Portuguese
- Externalized dataset and disease catalog under [`data/`](/home/rafael/mastertech-ml/HEALTHIA/data)
- Modular project layout under [`src/`](/home/rafael/mastertech-ml/HEALTHIA/src)
- Text normalization pipeline with accent stripping, lightweight stemming, synonym mapping, abbreviation handling, and simple negation cues
- Hybrid TF-IDF feature space using word n-grams and character n-grams
- Ranked Top-5 differential output with confidence scores
- Low-confidence fallback: `Informações insuficientes para sugestão confiável`
- Educational disclaimer and emergency-aware warning behavior
- Reproducible training and evaluation pipeline with saved artifacts in [`models/`](/home/rafael/mastertech-ml/HEALTHIA/models)

## Project Structure

```text
data/
  disease_catalog.json
  symptom_cases.csv
models/
  healthia_pipeline.joblib
  evaluation_metrics.json
  training_summary.md
src/
  preprocessing/
  training/
  inference/
  evaluation/
api/
main.py
leitura.py
```

## Methodology

### 1. Dataset design

The original repository used a very small hardcoded symptom list. It has been replaced with:

- [`data/disease_catalog.json`](/home/rafael/mastertech-ml/HEALTHIA/data/disease_catalog.json): structured disease definitions spanning infectious, respiratory, gastrointestinal, neurological, urinary, metabolic, cardiovascular, dermatological, allergy, primary care, and mental health conditions
- [`data/symptom_cases.csv`](/home/rafael/mastertech-ml/HEALTHIA/data/symptom_cases.csv): a generated balanced dataset with 2,280 synthetic-but-natural Portuguese symptom descriptions across 38 diseases

Brazil-relevant infectious diseases such as `dengue`, `zika`, and `chikungunya` are included, along with common primary care and emergency-relevant conditions such as `gripe`, `asma`, `infeccao_urinaria`, `apendicite`, `pneumonia`, `avc`, and `infarto_agudo_miocardio`.

### 2. Text preprocessing

The reusable preprocessing layer is implemented in [`src/preprocessing/text.py`](/home/rafael/mastertech-ml/HEALTHIA/src/preprocessing/text.py). It performs:

- lowercasing
- accent normalization
- tokenization
- lightweight Portuguese stopword filtering
- simple rule-based stemming
- abbreviation expansion
- symptom synonym normalization
- lightweight misspelling correction using fuzzy matching
- basic negation cue handling

### 3. Feature engineering

The final model uses:

- word-level TF-IDF with 1-2 grams
- character-level TF-IDF with 3-5 grams
- chi-square feature selection

This gives robustness to spelling variation and colloquial phrasing while remaining efficient and scalable for classical ML.

### 4. Model choice

The final classifier is multinomial logistic regression with balanced class weights. It was selected because it:

- performs strongly on sparse text features
- scales well to larger datasets
- provides calibrated `predict_proba` outputs for Top-N ranking
- is simple to deploy in production APIs

## Evaluation

Latest saved metrics are stored in [`models/evaluation_metrics.json`](/home/rafael/mastertech-ml/HEALTHIA/models/evaluation_metrics.json).

Current run:

- Accuracy: `0.9934`
- Macro F1: `0.9934`
- Macro Precision: `0.9934`
- Macro Recall: `0.9934`
- Cross-validation accuracy mean: `0.994`
- Number of classes: `38`

The evaluation pipeline includes:

- stratified train/test split
- 5-fold stratified cross-validation
- per-class precision/recall/F1 in the saved classification report
- confusion matrix persisted to the metrics artifact

## API

The FastAPI application is defined in [`main.py`](/home/rafael/mastertech-ml/HEALTHIA/main.py) and [`api/sintomasAPI.py`](/home/rafael/mastertech-ml/HEALTHIA/api/sintomasAPI.py).

### GET

```bash
curl "http://127.0.0.1:8000/predict/?sintomas=febre alta,dor atras dos olhos,dor no corpo&top_n=5"
```

### POST

```bash
curl -X POST "http://127.0.0.1:8000/predict/" \
  -H "Content-Type: application/json" \
  -d '{"sintomas":"dor no peito em aperto com suor frio e falta de ar","top_n":5}'
```

Example response shape:

```json
{
  "input_text": "dor no peito em aperto com suor frio e falta de ar",
  "normalized_text": "dor_peito aperto sudorese falta_ar",
  "top_predictions": [
    {
      "disease": "infarto_agudo_miocardio",
      "confidence": 0.6389,
      "domain": "cardiovascular",
      "severity": "severe",
      "is_emergency": true
    }
  ],
  "warning": "Foram encontradas hipóteses potencialmente urgentes. Procure avaliação profissional imediata se houver piora clínica.",
  "disclaimer": "Projeto educacional. Esta ferramenta sugere hipóteses de estudo e não substitui avaliação médica profissional."
}
```

## How To Run

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Regenerate dataset and retrain model

```bash
python leitura.py
```

Or run training directly:

```bash
python -m src.training.train
```

### 3. Start the API

```bash
uvicorn main:app --reload
```

## Safety and Ethical Guardrails

- The project is educational and explicitly non-diagnostic.
- Empty, meaningless, or very low-confidence input returns a fallback warning instead of a forced disease label.
- The API includes a disclaimer on every prediction response.
- Potentially urgent predictions can surface an escalation warning.

## Limitations

- The dataset is synthetic and generated from a curated disease catalog rather than clinical records.
- High evaluation scores reflect the current generated dataset and should not be interpreted as clinical validity.
- Negation and symptom context handling are intentionally lightweight, not full clinical NLP.
- The project does not model labs, vitals, imaging, medications, or longitudinal history.

## Future Improvements

- richer probabilistic differential diagnosis ranking
- more realistic data generation and external benchmark datasets
- better calibration analysis and top-k accuracy reporting
- retrieval over guideline snippets for explanation
- multilingual support and stronger colloquial slang normalization
- richer emergency triage heuristics
