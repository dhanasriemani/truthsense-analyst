from flask import Flask, render_template, request, jsonify
import joblib
import re
import string
import os

# Set up paths relative to this file
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
template_dir = os.path.join(base_dir, 'templates')
static_dir = os.path.join(base_dir, 'static')
models_dir = os.path.join(base_dir, 'models')

app = Flask(__name__, 
            template_folder=template_dir, 
            static_folder=static_dir)

# Load model and vectorizer
try:
    model_path = os.path.join(models_dir, 'xgboost_model.joblib')
    tfidf_path = os.path.join(models_dir, 'tfidf_vectorizer.joblib')
    model = joblib.load(model_path)
    tfidf = joblib.load(tfidf_path)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    tfidf = None

def clean_text(text):
    # Remove "Reuters" keyword but keep the rest of the text structure
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

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or tfidf is None:
        return jsonify({'error': 'Model not loaded'}), 500
        
    data = request.get_json()
    news_text = data.get('text', '')
    
    if not news_text:
        return jsonify({'error': 'No text provided'}), 400
    
    cleaned_text = clean_text(news_text)
    vectorized_text = tfidf.transform([cleaned_text])
    
    # Get probabilities
    probability = model.predict_proba(vectorized_text)[0]
    confidence = float(max(probability))
    prediction = int(model.predict(vectorized_text)[0])
    
    # Logic for uncertainty threshold (Tuned for Logistic Regression)
    if confidence < 0.60:
        result = "Uncertain"
    else:
        result = "Fake" if prediction == 1 else "Real"
    
    return jsonify({
        'prediction': result,
        'confidence': round(confidence * 100, 2)
    })

# Export for Vercel
app_handler = app

if __name__ == '__main__':
    app.run(debug=True, port=5000)
