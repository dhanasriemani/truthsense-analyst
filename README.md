# TruthSense : Fake News Detection System

TruthSense is a professional-grade machine learning application designed to identify and classify news articles as "Real" or "Fake" with high precision. It utilizes advanced Natural Language Processing (NLP) and the XGBoost gradient boosting framework.

## 🚀 Features
- **High Accuracy**: Achieved **99.73% accuracy** on the ISOT dataset.
- **Modern Web Interface**: Premium, responsive UI built with vanilla HTML/CSS/JS.
- **Robust Pipeline**: End-to-end ML pipeline from text cleaning to real-time prediction.
- **Scalable Backend**: Lightweight Flask API for seamless model serving.

## 🛠️ Tech Stack
- **Machine Learning**: Python, XGBoost, Scikit-learn, Pandas.
- **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency).
- **Backend**: Flask.
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (ES6+).

## 📋 Installation & Usage

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the Model
(Optional, as model is already pre-trained)
```bash
python train_model.py
```

### 3. Run the Web App
#### Local Testing
```bash
python api/index.py
```
#### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root and follow the prompts.

## 📊 Model Evaluation
- **Accuracy**: 97.69% (Generalizable Pro Model)
- **Framework**: Logistic Regression with de-biased TF-IDF.

## 📁 Project Structure
- `api/index.py`: Main Flask entry point (Vercel compatible).
- `vercel.json`: Vercel deployment configuration.
- `train_model.py`: ML training and persistence script.
- `models/`: Directory containing saved model artifacts.
- `templates/`: HTML templates (Responsive).
- `static/`: CSS styles and JavaScript (with Real-time Analytics).
- `True.csv` & `Fake.csv`: Datasets.

---
*Created for portfolio demonstration. Ready for deployment.*
