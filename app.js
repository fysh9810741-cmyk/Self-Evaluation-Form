// 全局變數存儲原始分數（用於模擬功能）
let globalOriginalScores = {};
let globalOriginalFinalScore = 0;

document.getElementById('workForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateValue();
});

function calculateValue() {
    const salary = parseFloat(document.getElementById('salary').value);
    const workDays = parseInt(document.getElementById('workDays').value, 10);
    const dailyHours = parseFloat(document.getElementById('dailyHours').value);
    const commuteTime = parseFloat(document.getElementById('commuteTime').value);
    const vacationDays = parseInt(document.getElementById('vacationDays').value, 10);
    const workFromHome = parseInt(document.getElementById('workFromHome').value, 10);
    const education = document.getElementById('education').value;
    const experience = parseFloat(document.getElementById('experience').value);

    const inputs = [salary, workDays, dailyHours, commuteTime, vacationDays, workFromHome, experience];
    if (inputs.some(value => Number.isNaN(value))) {
        alert('請完整填寫所有數值欄位');
        return;
    }

    // 台灣職場參考數據
    const avgSalary = 60; // 萬元
    const avgWorkDays = 5;
    const avgDailyHours = 8;
    const avgCommuteTime = 1.5; // 小時
    const avgVacationDays = 7; // 天
    const avgWorkFromHome = 1; // 天

    // 薪資評分 (0-10)
    let salaryScore = Math.min(salary / avgSalary * 5, 10);
    if (education === '高中' && salary > 40) salaryScore += 1;
    if (education === '大學' && experience > 3 && salary < 50) salaryScore -= 1;
    salaryScore = Math.max(0, Math.min(10, salaryScore));

    // 工作時間評分 (0-10，考慮每周工作天數和通勤)
    const effectiveDailyHours = dailyHours + commuteTime;
    const weeklyHours = workDays * effectiveDailyHours;
    const avgWeeklyHours = avgWorkDays * (avgDailyHours + avgCommuteTime);
    let timeScore = 10 - ((weeklyHours - avgWeeklyHours) / avgWeeklyHours * 5);
    timeScore = Math.max(0, Math.min(10, timeScore));

    // 通勤評分 (0-10, 越低越好)
    let commuteScore = 10 - (commuteTime / avgCommuteTime * 5);
    commuteScore = Math.max(0, Math.min(10, commuteScore));

    // 休假評分 (0-10)
    let vacationScore = Math.min(vacationDays / avgVacationDays * 10, 10);

    // 在家工作評分 (0-10)
    let wfhScore = Math.min(workFromHome / avgWorkFromHome * 10, 10);

    // 學歷與經驗匹配評分 (0-10)
    let matchScore = 5;
    if (education === '大學' && experience > 2) matchScore += 2;
    if (education === '碩士' && experience > 1) matchScore += 2;
    if (salary > 80 && education === '大學') matchScore += 1;
    matchScore = Math.max(0, Math.min(10, matchScore));

    // 最終評分 (加權平均)
    const finalScore = Math.round((salaryScore * 0.3 + timeScore * 0.2 + commuteScore * 0.15 + vacationScore * 0.15 + wfhScore * 0.1 + matchScore * 0.1) * 10) / 10;

    // 保存到全局變量供模擬功能使用
    globalOriginalScores = {
        salary: salaryScore,
        time: timeScore,
        commute: commuteScore,
        vacation: vacationScore,
        wfh: wfhScore,
        match: matchScore
    };
    globalOriginalFinalScore = finalScore;

    // 顯示報告
    document.getElementById('finalScore').textContent = finalScore;
    createChart(salaryScore, timeScore, commuteScore, vacationScore, wfhScore, matchScore);
    showOverallAssessment(finalScore);
    showImprovementSuggestions(salaryScore, timeScore, commuteScore, vacationScore, wfhScore, matchScore);
    createImprovementSimulator();
    document.getElementById('dimensions').innerHTML = `
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">💰</span>
                薪資水平
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${salaryScore * 10}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
            </div>
            <div class="comment">${getSalaryComment(salaryScore)}</div>
            <div class="explanation">基於台灣平均年薪60萬元評估，考慮學歷和工作經驗的匹配度。</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">⏰</span>
                工作時間
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${timeScore * 10}%; background: linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
            </div>
            <div class="comment">${getTimeComment(timeScore)}</div>
            <div class="explanation">綜合每周工作天數、每日工時和通勤時間，與台灣平均水平比較。</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🚗</span>
                通勤成本
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${commuteScore * 10}%; background: linear-gradient(90deg, #ef4444, #f87171);"></div>
            </div>
            <div class="comment">${getCommuteComment(commuteScore)}</div>
            <div class="explanation">評估通勤時間對生活品質的影響，台灣平均通勤時間約1.5小時。</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🏖️</span>
                休假福利
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${vacationScore * 10}%; background: linear-gradient(90deg, #3b82f6, #60a5fa);"></div>
            </div>
            <div class="comment">${getVacationComment(vacationScore)}</div>
            <div class="explanation">基於特休天數評估，台灣勞工平均特休約7天。</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🏠</span>
                遠距工作
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${wfhScore * 10}%; background: linear-gradient(90deg, #8b5cf6, #a855f7);"></div>
            </div>
            <div class="comment">${getWFHComment(wfhScore)}</div>
            <div class="explanation">評估在家工作頻率，台灣平均每周約1天。</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🎓</span>
                學歷與經驗匹配
            </div>
            <div class="score-bar">
                <div class="score-fill" style="width: ${matchScore * 10}%; background: linear-gradient(90deg, #ec4899, #f472b6);"></div>
            </div>
            <div class="comment">${getMatchComment(matchScore)}</div>
            <div class="explanation">評估學歷背景與薪資、工作經驗的匹配程度。</div>
        </div>
    `;
    document.getElementById('report').style.display = 'block';
}

function createChart(salaryScore, timeScore, commuteScore, vacationScore, wfhScore, matchScore) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['薪資水平', '工作時間', '通勤成本', '休假福利', '遠距工作', '學歷匹配'],
            datasets: [{
                label: '您的評分',
                data: [salaryScore, timeScore, commuteScore, vacationScore, wfhScore, matchScore],
                fill: true,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '各維度評分雷達圖',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 2
                }
            }
        }
    });
}

function getSalaryComment(score) {
    if (score >= 8) return "薪資相當優渥，遠超台灣平均水平，工作價值感強烈。";
    if (score >= 6) return "薪資水平不錯，符合台灣中上層水準，性價比尚可。";
    if (score >= 4) return "薪資一般，與台灣平均相近，需要考慮其他福利。";
    return "薪資偏低，建議評估是否值得投入如此精力。";
}

function getTimeComment(score) {
    if (score >= 8) return "工作時間合理，生活品質較高，有足夠休息時間。";
    if (score >= 6) return "工作時間適中，雖有壓力但尚可承受。";
    if (score >= 4) return "工作時間較長，需注意工作與生活的平衡。";
    return "工作時間過長，容易造成身心疲憊，建議尋求改善。";
}

function getCommuteComment(score) {
    if (score >= 8) return "通勤時間短暫，節省大量時間與精力。";
    if (score >= 6) return "通勤時間合理，不會過度影響日常生活。";
    if (score >= 4) return "通勤時間稍長，建議考慮交通優化或搬遷。";
    return "通勤時間過長，嚴重影響生活品質與工作效率。";
}

function getVacationComment(score) {
    if (score >= 8) return "特休天數充足，能充分休息與充電。";
    if (score >= 6) return "特休天數不錯，有一定休息空間。";
    if (score >= 4) return "特休天數一般，建議爭取更多休假。";
    return "特休天數不足，長期下來容易累積疲勞。";
}

function getWFHComment(score) {
    if (score >= 8) return "在家工作機會多，能大幅減少通勤與提升彈性。";
    if (score >= 6) return "在家工作機會中等，部分日子能享受便利。";
    if (score >= 4) return "在家工作機會有限，建議與主管討論增加。";
    return "幾乎沒有在家工作機會，需長期面對通勤壓力。";
}

function getMatchComment(score) {
    if (score >= 8) return "學歷與經驗與薪資高度匹配，職業發展潛力大。";
    if (score >= 6) return "學歷與經驗基本匹配，工作穩定性高。";
    if (score >= 4) return "學歷與經驗略有落差，建議持續學習提升。";
    return "學歷與經驗與薪資不匹配，可能存在發展瓶頸。";
}

function showOverallAssessment(finalScore) {
    let assessmentClass = 'good';
    let title = '🎯 工作性價比評估';
    let text = '';

    if (finalScore >= 8) {
        assessmentClass = 'excellent';
        title = '🌟 優秀的工作機會！';
        text = '這份工作整體表現優異，薪資、工作時間、生活平衡各方面都很出色。建議繼續投入並積極發展職業生涯。';
    } else if (finalScore >= 6) {
        title = '👍 不錯的工作機會';
        text = '這份工作整體表現良好，性價比尚可。雖然有些地方可以改進，但整體來說是值得投入的工作。';
    } else if (finalScore >= 4) {
        assessmentClass = 'poor';
        title = '⚠️ 需要仔細考慮';
        text = '這份工作性價比偏低，多個面向需要改進。建議評估是否值得長期投入，或考慮尋找更好的機會。';
    } else {
        assessmentClass = 'poor';
        title = '❌ 建議重新評估';
        text = '這份工作性價比很低，建議認真考慮轉換跑道或尋找更適合的工作機會。';
    }

    document.getElementById('overallAssessment').className = `overall-assessment ${assessmentClass}`;
    document.getElementById('overallAssessment').innerHTML = `
        <div class="assessment-title">${title}</div>
        <div class="assessment-text">${text}</div>
    `;
}

function showImprovementSuggestions(salaryScore, timeScore, commuteScore, vacationScore, wfhScore, matchScore) {
    const suggestions = [];

    if (salaryScore < 6) {
        suggestions.push({
            title: '💰 提升薪資水平',
            content: '考慮與主管討論薪資調整，或尋找同行業更高薪的職缺。也可以通過提升技能來增加議價空間。'
        });
    }

    if (timeScore < 6) {
        suggestions.push({
            title: '⏰ 優化工作時間',
            content: '與主管討論工作負擔分配，或學習時間管理技巧。考慮是否可以減少加班或調整工作方式。'
        });
    }

    if (commuteScore < 6) {
        suggestions.push({
            title: '🚗 改善通勤狀況',
            content: '考慮搬遷到公司附近、改用更有效率的交通工具，或與公司討論遠距工作政策。'
        });
    }

    if (vacationScore < 6) {
        suggestions.push({
            title: '🏖️ 增加休假天數',
            content: '了解公司休假政策，積極使用特休假。與主管討論工作與生活的平衡。'
        });
    }

    if (wfhScore < 6) {
        suggestions.push({
            title: '🏠 增加遠距工作',
            content: '與主管討論遠距工作可能性，這不僅能減少通勤，還能提升工作效率。'
        });
    }

    if (matchScore < 6) {
        suggestions.push({
            title: '🎓 提升專業能力',
            content: '考慮進修相關技能、考取專業證照，或尋找更符合您背景的職位。'
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            title: '✨ 保持現狀並持續成長',
            content: '您的表現已經很出色！建議繼續在現有崗位上精進技能，為未來發展做好準備。'
        });
    }

    const suggestionsHtml = suggestions.map(suggestion => `
        <div class="suggestion-item">
            <h4>${suggestion.title}</h4>
            <p>${suggestion.content}</p>
        </div>
    `).join('');

    document.getElementById('improvementSuggestions').innerHTML = `
        <div class="improvement-title">
            <span class="emoji">🚀</span>
            改進建議
        </div>
        ${suggestionsHtml}
    `;
}

function createImprovementSimulator() {
    document.getElementById('simulatorSection').innerHTML = `
        <div class="simulator-title">
            <span class="emoji">🔮</span>
            模擬改進效果
        </div>
        <div class="simulator-controls">
            <div class="control-item">
                <div class="control-label">薪資提升</div>
                <div class="slider-container">
                    <input type="range" class="slider" id="salarySlider" min="0" max="50" value="0" step="5">
                    <span class="slider-value" id="salaryValue">0%</span>
                </div>
            </div>
            <div class="control-item">
                <div class="control-label">工作時間優化</div>
                <div class="slider-container">
                    <input type="range" class="slider" id="timeSlider" min="0" max="50" value="0" step="5">
                    <span class="slider-value" id="timeValue">0%</span>
                </div>
            </div>
            <div class="control-item">
                <div class="control-label">通勤改善</div>
                <div class="slider-container">
                    <input type="range" class="slider" id="commuteSlider" min="0" max="50" value="0" step="5">
                    <span class="slider-value" id="commuteValue">0%</span>
                </div>
            </div>
            <div class="control-item">
                <div class="control-label">休假增加</div>
                <div class="slider-container">
                    <input type="range" class="slider" id="vacationSlider" min="0" max="50" value="0" step="5">
                    <span class="slider-value" id="vacationValue">0%</span>
                </div>
            </div>
            <div class="control-item">
                <div class="control-label">遠距工作</div>
                <div class="slider-container">
                    <input type="range" class="slider" id="wfhSlider" min="0" max="50" value="0" step="5">
                    <span class="slider-value" id="wfhValue">0%</span>
                </div>
            </div>
            <div class="control-item">
                <div class="control-label">技能提升</div>
                <div class="slider-container">
                    <input type="range" class="slider" id="matchSlider" min="0" max="50" value="0" step="5">
                    <span class="slider-value" id="matchValue">0%</span>
                </div>
            </div>
        </div>
        <button class="simulate-btn" onclick="runSimulation()">模擬改進效果</button>
        <div class="simulated-result" id="simulatedResult"></div>
    `;

    // 添加滑桿事件監聽器和實時反饋
    const sliders = ['salary', 'time', 'commute', 'vacation', 'wfh', 'match'];
    sliders.forEach(type => {
        const slider = document.getElementById(`${type}Slider`);
        const value = document.getElementById(`${type}Value`);
        if (slider && value) {
            slider.addEventListener('input', function() {
                value.textContent = this.value + '%';
                // 實時更新視覺反饋
                updateSliderFeedback(type, this.value);
            });
        }
    });
}

function updateSliderFeedback(dimensionType, percentage) {
    const valueLabel = document.getElementById(`${dimensionType}Value`);
    // 根據改進幅度改變顏色
    if (percentage >= 30) {
        valueLabel.style.color = '#10b981'; // 綠色 - 顯著改進
    } else if (percentage >= 15) {
        valueLabel.style.color = '#f59e0b'; // 黃色 - 中等改進
    } else if (percentage > 0) {
        valueLabel.style.color = '#6b7280'; // 灰色 - 輕微改進
    } else {
        valueLabel.style.color = '#d1d5db'; // 淡灰色 - 無改進
    }
}

function getOverallComment(score) {
    if (score >= 9) return "🌟 優秀！工作機會極其難得，強烈建議長期投入並積極發展。";
    if (score >= 8) return "💎 很好！工作整體表現優異，值得認真投入和珍惜。";
    if (score >= 7) return "👍 不錯！工作性價比良好，有明確的發展前景。";
    if (score >= 6) return "🟢 可以！工作整體尚可，但仍有改進空間。";
    if (score >= 5) return "🟡 中等。工作性價比普通，建議評估是否長期投入。";
    if (score >= 4) return "🟠 較差。工作存在明顯劣勢，需要認真權衡。";
    if (score >= 3) return "🔴 不佳。工作價值偏低，建議尋找更好的機會。";
    return "❌ 非常不佳。強烈建議立即尋找其他工作機會。";
}

function runSimulation() {
    // 使用全局變量獲取原始分數
    const originalScores = globalOriginalScores;
    const originalFinalScore = globalOriginalFinalScore;

    const improvements = {
        salary: parseInt(document.getElementById('salarySlider').value) / 100,
        time: parseInt(document.getElementById('timeSlider').value) / 100,
        commute: parseInt(document.getElementById('commuteSlider').value) / 100,
        vacation: parseInt(document.getElementById('vacationSlider').value) / 100,
        wfh: parseInt(document.getElementById('wfhSlider').value) / 100,
        match: parseInt(document.getElementById('matchSlider').value) / 100
    };

    // 計算模擬後的分數
    const simulatedScores = {};
    Object.keys(originalScores).forEach(key => {
        simulatedScores[key] = Math.min(10, originalScores[key] * (1 + improvements[key]));
    });

    // 計算新的最終分數
    const simulatedFinalScore = Math.round((
        simulatedScores.salary * 0.3 +
        simulatedScores.time * 0.2 +
        simulatedScores.commute * 0.15 +
        simulatedScores.vacation * 0.15 +
        simulatedScores.wfh * 0.1 +
        simulatedScores.match * 0.1
    ) * 10) / 10;

    const improvement = simulatedFinalScore - originalFinalScore;
    
    // 獲取改進前後的評語
    const originalComment = getOverallComment(originalFinalScore);
    const simulatedComment = getOverallComment(simulatedFinalScore);
    
    // 計算各維度的改進幅度
    const dimensionImprovements = {
        salary: simulatedScores.salary - originalScores.salary,
        time: simulatedScores.time - originalScores.time,
        commute: simulatedScores.commute - originalScores.commute,
        vacation: simulatedScores.vacation - originalScores.vacation,
        wfh: simulatedScores.wfh - originalScores.wfh,
        match: simulatedScores.match - originalScores.match
    };
    
    // 找出改進幅度最大的維度
    let maxImprovedDimension = '';
    let maxImprovement = 0;
    Object.entries(dimensionImprovements).forEach(([key, value]) => {
        if (value > maxImprovement) {
            maxImprovement = value;
            maxImprovedDimension = key;
        }
    });
    
    const dimensionNames = {
        salary: '薪資',
        time: '工作時間',
        commute: '通勤',
        vacation: '休假',
        wfh: '遠距工作',
        match: '技能匹配'
    };

    document.getElementById('simulatedResult').innerHTML = `
        <div class="simulation-comparison">
            <div class="comparison-item original">
                <div class="comparison-label">改進前</div>
                <div class="simulated-score">${originalFinalScore}</div>
                <div class="simulated-comment">${originalComment}</div>
            </div>
            <div class="comparison-arrow">→</div>
            <div class="comparison-item simulated">
                <div class="comparison-label">改進後</div>
                <div class="simulated-score improved">${simulatedFinalScore}</div>
                <div class="improvement-amount ${improvement >= 0 ? 'positive' : 'negative'}">
                    ${improvement >= 0 ? '⬆️ +' : '⬇️ '}${Math.abs(improvement).toFixed(1)} 分
                </div>
                <div class="simulated-comment">${simulatedComment}</div>
            </div>
        </div>
        ${maxImprovement > 0 ? `
        <div class="improvement-highlights">
            <div class="highlight-title">最大改進方向</div>
            <div class="highlight-content">📈 <strong>${dimensionNames[maxImprovedDimension]}</strong> 提升了 <strong>${(maxImprovement).toFixed(1)}</strong> 分</div>
        </div>
        ` : ''}
    `;
    document.getElementById('simulatedResult').style.display = 'block';
}
