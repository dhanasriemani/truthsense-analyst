document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    const newsInput = document.getElementById('news-input');
    const resultArea = document.getElementById('result-area');
    const loader = document.getElementById('loader');
    const btnText = analyzeBtn.querySelector('.btn-text');

    // Analytics Logic
    let stats = JSON.parse(localStorage.getItem('truthsense_stats')) || {
        total: 0,
        real: 0,
        fake: 0,
        history: []
    };

    function updateStatsUI() {
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-real').textContent = stats.real;
        document.getElementById('stat-fake').textContent = stats.fake;
        
        const logBody = document.getElementById('activity-log');
        const noActivity = document.getElementById('no-activity');
        
        if (stats.history.length > 0) {
            noActivity.style.display = 'none';
            logBody.innerHTML = stats.history.slice(-5).reverse().map(item => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 0.75rem 0; color: var(--text-secondary);">${item.time}</td>
                    <td style="padding: 0.75rem 0;"><span style="color: ${item.result === 'Real' ? 'var(--success)' : (item.result === 'Fake' ? 'var(--danger)' : 'var(--warning)')}; font-weight: 600;">${item.result}</span></td>
                    <td style="padding: 0.75rem 0;">${item.confidence}%</td>
                </tr>
            `).join('');
        } else {
            noActivity.style.display = 'block';
            logBody.innerHTML = '';
        }
    }

    function recordAnalysis(result, confidence) {
        stats.total++;
        if (result === 'Real') stats.real++;
        if (result === 'Fake') stats.fake++;
        
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        stats.history.push({
            time: timeStr,
            result: result,
            confidence: confidence
        });
        
        localStorage.setItem('truthsense_stats', JSON.stringify(stats));
        updateStatsUI();
    }

    document.getElementById('reset-stats').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all session data?')) {
            stats = { total: 0, real: 0, fake: 0, history: [] };
            localStorage.removeItem('truthsense_stats');
            updateStatsUI();
        }
    });

    // Initialize UI
    updateStatsUI();

    analyzeBtn.addEventListener('click', async () => {
        const text = newsInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }

        // Show loading state
        analyzeBtn.disabled = true;
        loader.style.display = 'block';
        btnText.style.opacity = '0';
        resultArea.style.display = 'none';

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                displayResult(data);
                recordAnalysis(data.prediction, data.confidence);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze the news. Is the server running?');
        } finally {
            // Hide loading state
            analyzeBtn.disabled = false;
            loader.style.display = 'none';
            btnText.style.opacity = '1';
        }
    });

    clearBtn.addEventListener('click', () => {
        newsInput.value = '';
        resultArea.style.display = 'none';
    });

    function displayResult(data) {
        let typeClass, labelText, analysisSummary;
        
        if (data.prediction === 'Fake') {
            typeClass = 'fake';
            labelText = 'Suspicious Pattern';
            analysisSummary = 'High correlation with known misinformation linguistic markers.';
        } else if (data.prediction === 'Real') {
            typeClass = 'real';
            labelText = 'Verified Authentic';
            analysisSummary = 'Matches factual reporting structures and neutral linguistic patterns.';
        } else {
            typeClass = 'uncertain';
            labelText = 'Neutral / Inconclusive';
            analysisSummary = 'Insufficient stylistic markers to determine authenticity with high confidence.';
        }
        
        resultArea.innerHTML = `
            <div class="result-card ${typeClass}">
                <div class="status-badge">${labelText}</div>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${analysisSummary}</h2>
                <div class="confidence-meter">
                    <div class="confidence-fill" style="width: ${data.confidence}%"></div>
                </div>
                <div class="confidence">Confidence Score: ${data.confidence}%</div>
            </div>
        `;
        
        resultArea.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
