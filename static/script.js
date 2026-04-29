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
                <tr>
                    <td>${item.time}</td>
                    <td><span style="color: ${item.result === 'Real' ? 'var(--success)' : (item.result === 'Fake' ? 'var(--danger)' : 'var(--warning)')}; font-weight: 600;">${item.result}</span></td>
                    <td style="font-family: 'JetBrains Mono', monospace;">${item.confidence}%</td>
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
        if (confirm('Reset session database?')) {
            stats = { total: 0, real: 0, fake: 0, history: [] };
            localStorage.removeItem('truthsense_stats');
            updateStatsUI();
        }
    });

    updateStatsUI();

    analyzeBtn.addEventListener('click', async () => {
        const text = newsInput.value.trim();
        if (!text) return;

        analyzeBtn.disabled = true;
        loader.style.display = 'block';
        btnText.style.display = 'none';
        resultArea.style.display = 'none';

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.error) {
                alert('Analysis Error: ' + data.error);
            } else {
                displayResult(data);
                recordAnalysis(data.prediction, data.confidence);
            }
        } catch (error) {
            alert('Connection failure to verification engine.');
        } finally {
            analyzeBtn.disabled = false;
            loader.style.display = 'none';
            btnText.style.display = 'block';
        }
    });

    clearBtn.addEventListener('click', () => {
        newsInput.value = '';
        resultArea.style.display = 'none';
    });

    function displayResult(data) {
        let statusClass, labelText, analysisSummary;
        
        if (data.prediction === 'Fake') {
            statusClass = 'fake-status';
            labelText = 'Linguistic Variance Flagged';
            analysisSummary = 'Classification: High variance from verified neutral news patterns.';
        } else if (data.prediction === 'Real') {
            statusClass = 'real-status';
            labelText = 'Linguistic Pattern Verified';
            analysisSummary = 'Classification: Consistent with authentic editorial structures.';
        } else {
            statusClass = 'uncertain-status';
            labelText = 'Variance Inconclusive';
            analysisSummary = 'Classification: Statistical markers fall outside high-confidence thresholds.';
        }
        
        resultArea.innerHTML = `
            <div class="result-box">
                <div class="status-indicator ${statusClass}">${labelText}</div>
                <div class="analysis-text">${analysisSummary}</div>
                <div class="metric-label">
                    <span>Confidence Coefficient</span>
                    <span>${data.confidence}%</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${data.confidence}%"></div>
                </div>
            </div>
        `;
        
        resultArea.style.display = 'block';
    }
});
