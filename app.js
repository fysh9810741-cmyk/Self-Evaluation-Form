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

    // 顯示報告
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('dimensions').innerHTML = `
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">💰</span>
                薪資水平
            </div>
            <div class="comment">${getSalaryComment(salaryScore)}</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">⏰</span>
                工作時間
            </div>
            <div class="comment">${getTimeComment(timeScore)}</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🚗</span>
                通勤成本
            </div>
            <div class="comment">${getCommuteComment(commuteScore)}</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🏖️</span>
                休假福利
            </div>
            <div class="comment">${getVacationComment(vacationScore)}</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🏠</span>
                遠距工作
            </div>
            <div class="comment">${getWFHComment(wfhScore)}</div>
        </div>
        <div class="dimension">
            <div class="dimension-header">
                <span class="emoji">🎓</span>
                學歷與經驗匹配
            </div>
            <div class="comment">${getMatchComment(matchScore)}</div>
        </div>
    `;
    document.getElementById('report').style.display = 'block';
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
