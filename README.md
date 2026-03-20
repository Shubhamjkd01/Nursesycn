# 🏥 NurseSync – Hospital Task Management System

Full-stack project: **Python Flask** backend + **React (Vite)** frontend.

---

## 📁 Project Structure

```
nursesync/
├── backend/
│   ├── ml/
│   │   ├── __init__.py
│   │   └── predictor.py       # Risk score logic
│   ├── main.py                # Flask REST API
│   ├── init_db.py             # Reset DB to defaults
│   ├── nursesync.db           # Auto-created JSON data store
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AppShell.jsx   # Layout: sidebar + header
    │   │   ├── PatientCard.jsx
    │   │   ├── EmergencyModal.jsx
    │   │   └── ConfirmModal.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Patients.jsx
    │   │   ├── PatientDetail.jsx
    │   │   ├── Heatmap.jsx
    │   │   ├── Transfer.jsx
    │   │   ├── DoctorPanel.jsx
    │   │   ├── ShiftHandoff.jsx
    │   │   └── Analytics.jsx
    │   ├── utils/
    │   │   └── api.js         # All API calls
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server (runs on http://localhost:5000)
python main.py
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Demo Accounts

| Staff ID | Password  | Role       | Shift     |
|----------|-----------|------------|-----------|
| N001     | nurse123  | Head Nurse | Morning   |
| N002     | nurse123  | Staff Nurse| Afternoon |
| N003     | nurse123  | Staff Nurse| Night     |

---

## ✨ Features

- **Dashboard** – Stats, ward tasks, priority patients, medicine timeline
- **Patient List** – All assigned patients sorted by priority
- **Patient Detail** – Diet & medicine tracking, nurse notes → doctor panel
- **Ward Heatmap** – 12-ward activity heatmap + chart
- **Task Transfer** – 3-step wizard to transfer tasks to other nurses
- **Doctor Panel** – All nurse notes forwarded for doctor review
- **Shift Handoff** – Auto-generated handoff summary on logout
- **Analytics** – 4 charts: condition distribution, task completion, med vs diet, hourly activity
- **Emergency Alert** – One-click emergency notification system
- **Toast Notifications** – Real-time feedback on all actions

---

## 🛠 Tech Stack

| Layer    | Technology            |
|----------|-----------------------|
| Backend  | Python, Flask, Flask-CORS |
| Database | JSON flat-file (nursesync.db) |
| Frontend | React 18, Vite        |
| Charts   | Chart.js              |
| Fonts    | Google Fonts (Nunito + DM Sans) |
