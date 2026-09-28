# GovBuild360 — Risk & Health Methodology

> **Central Innovation**:  
> **"Maintain based on actual infrastructure risk and dependency impact, not only on a fixed maintenance schedule."**

---

## 1. Health Score Calculation (0–100)

Asset Health is calculated dynamically using weighted physical condition, telemetry anomaly readings, defects, failure history, and age factors:

$$\text{Health Score} = 100 - \text{Condition Penalty} - \text{Telemetry Penalty} - \text{Defect Penalty} - \text{Failure Penalty} - \text{Age Penalty}$$

### Penalty Weights
- **Physical Condition Rating**: Critical (-35), Poor (-25), Moderate (-15), Good (0).
- **Vibration Anomaly**: > 3.5 mm/s (-20), > 2.5 mm/s (-10).
- **Temperature Anomaly**: > 85°C (-20), > 70°C (-10).
- **Physical Defects**: Structural Damage (-15), Corrosion (-10), Leakage (-10).
- **Recent Failure Penalty**: $\min(30, \text{FailureCount} \times 10)$.
- **Age Ratio Penalty**: $\frac{\text{Age}}{\text{ExpectedLife}} > 1.2 \Rightarrow -20$.

---

## 2. Risk Score Calculation (0–100)

$$\text{Raw Risk} = \text{Risk}_{\text{Health}} + \text{Risk}_{\text{Failures}} + \text{Risk}_{\text{Age}} + \text{Risk}_{\text{Telemetry}} + \text{Risk}_{\text{Overdue}} + \text{Risk}_{\text{Dependencies}}$$

$$\text{Final Risk Score} = \min\left(100, \text{Raw Risk} \times \text{Criticality Multiplier}\right)$$

### Risk Categories
- **0–30**: LOW Risk
- **31–60**: MEDIUM Risk
- **61–80**: HIGH Risk
- **81–100**: CRITICAL Risk

---

## 3. Dynamic Maintenance Priority Engine

Unlike traditional static calendar schedules (e.g., maintain on 20 Dec 2026), GovBuild360 dynamically computes priority:

$$\text{Priority Score} = 0.6 \times \text{RiskScore} + 0.4 \times (100 - \text{HealthScore}) + \text{DependencyBonus}$$

### Priority Levels
- **URGENT**: Priority Score $\ge 75$ OR Health $\le 45\%$ OR Risk $\ge 75$.
- **HIGH**: Priority Score 55–74.
- **MEDIUM**: Priority Score 35–54.
- **LOW**: Priority Score $< 35$.

---

## 4. Transparent Explainable Reasons ("Why is this asset high risk?")

The system generates plain-language, explainable bullet points:
- `✓ Health score below 40% (Current: 42%)`
- `✓ Risk score 82 in CRITICAL zone`
- `✓ 3 previous failures in past 12 months`
- `✓ Abnormal vibration trend (4.8 mm/s vs 2.5 max)`
- `✓ Critical building emergency power dependency`
- `✓ Dynamic Override: Maintenance moved forward from calendar date`
