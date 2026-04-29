import pandas as pd
import numpy as np
import re
import string
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def clean_text(text):
    """
    Cleaner text processing that maintains stylistic features 
    but removes source-specific keywords.
    """
    # Remove specific source tags but keep the rest
    text = re.sub(r'\(Reuters\)', '', text)
    text = re.sub(r'\[.*?\]', '', text)
    
    text = text.lower()
    text = re.sub(r'\\W', ' ', text) 
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'<.*?>+', '', text)
    text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub(r'\n', '', text)
    text = re.sub(r'\w*\d\w*', '', text)    
    return text

def train_and_save():
    print("Loading data...")
    # Load datasets
    true_df = pd.read_csv('True.csv')
    fake_df = pd.read_csv('Fake.csv')

    # Add labels
    true_df['label'] = 0  # Real
    fake_df['label'] = 1  # Fake

    # Combine title and text for better context
    true_df['content'] = true_df['title'] + " " + true_df['text']
    fake_df['content'] = fake_df['title'] + " " + fake_df['text']

    # Merge
    df = pd.concat([true_df, fake_df], ignore_index=True)
    
    # Shuffle
    df = df.sample(frac=1).reset_index(drop=True)

    print("Preprocessing text...")
    df['content'] = df['content'].apply(clean_text)

    X = df['content']
    y = df['label']

    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Vectorizing text (TF-IDF)...")
    tfidf = TfidfVectorizer(stop_words='english', max_df=0.7, max_features=5000)
    X_train_tfidf = tfidf.fit_transform(X_train)
    X_test_tfidf = tfidf.transform(X_test)

    print("Training Logistic Regression model...")
    # Logistic Regression is more stable for text classification
    model = LogisticRegression(C=1.0, solver='liblinear', random_state=42)
    model.fit(X_train_tfidf, y_train)

    print("Evaluating model...")
    predictions = model.predict(X_test_tfidf)
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    print("Saving model and vectorizer...")
    # Create a directory for models if it doesn't exist
    if not os.path.exists('models'):
        os.makedirs('models')
        
    joblib.dump(model, 'models/xgboost_model.joblib')
    joblib.dump(tfidf, 'models/tfidf_vectorizer.joblib')
    print("Saved to models/ directory.")

if __name__ == "__main__":
    train_and_save()
