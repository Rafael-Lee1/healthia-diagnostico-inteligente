# 🧠 HealthIA — Context-Aware AI Symptom Triage Assistant

**HealthIA** is a full-stack AI application that analyzes symptoms and patient context to suggest likely conditions in an educational triage setting.  
It combines natural language processing, machine learning, and a modern SaaS-style interface to deliver context-aware insights safely and transparently.

> ⚠️ Educational tool — not a medical diagnosis system.

---

## ✨ Key Features

### 🔍 Symptom Analysis
- Accepts free-text symptom descriptions
- Handles noisy or incomplete input
- Uses NLP preprocessing for Portuguese clinical language

### 🧑‍⚕️ Patient Context Awareness
Optional contextual data improves relevance:

- Age  
- Sex  
- Pregnancy status  
- Pre-existing conditions  
- Current medications  
- Recent illnesses or surgeries  
- Lifestyle notes  

### 📊 Differential Suggestions
- Top-N probable conditions
- Confidence scores
- Clean, readable presentation

### 🧠 Explainability
Provides reasoning for the most probable condition:

> Why this condition was suggested (symptom + context based)

### 🕘 Local History
- Stores past analyses locally
- Privacy-preserving (no backend persistence)

### 🛡️ Safe UX Design
- Graceful handling of invalid input
- Clear disclaimers
- No treatment recommendations
- Robust error handling

---

## 🏗️ Architecture

### Backend (FastAPI + ML Pipeline)

- Context-aware prediction endpoint
- TF-IDF + classical ML classifier
- Lightweight context augmentation (no retraining required)
- Modular training and inference pipeline
- Backward-compatible API design

### Frontend (React + TypeScript + Tailwind)

- Modern SaaS-style interface
- Responsive layout
- Error-resilient components
- Collapsible patient context panel
- Context-aware result display

---

## 🚀 Live Demo

👉 **Production:**  
https://healthia-frontend-production.up.railway.app/

👉 **API Docs:**  
`/docs` endpoint on backend

---

## 📦 Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Component-driven architecture

### Backend
- FastAPI
- Python
- Scikit-learn
- Joblib model serialization

### Infrastructure
- Railway (deployment)
- GitHub (version control)

---

## 🧪 Model & Data

- Synthetic + curated symptom dataset
- ~2K+ training samples
- Multi-class classification
- Cross-validated evaluation
- Modular retraining pipeline

---

## 🔒 Privacy & Safety

- No personal data stored server-side
- Context saved locally only (optional)
- Educational positioning
- Explicit non-diagnostic disclaimer

---

## ⚙️ Local Development

### Backend

```bash
cd HEALTHIA
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
