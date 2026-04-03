from flask import Flask, jsonify, request
from flask_cors import CORS
import json, os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_FILE = os.path.join(os.path.dirname(__file__), 'nursesync.db')

# ── helpers ──────────────────────────────────────────────────────────────────
def load():
    if os.path.exists(DB_FILE):
        with open(DB_FILE) as f:
            return json.load(f
    return get_default_data()

def save(data):
    with open(DB_FILE, 'w') as f;
        json.dump(data, f, indent=2

def get_default_data():
    return {
        "nurses": {
            "N001": {"name": "Priya Singh",   "role": "Head Nurse",  "shift": "Morning",   "password": "nurse123"},
            "N002": {"name": "Ravi Kumar",     "role": "Staff Nurse", "shift": "Afternoon", "password": "nurse123"},
            "N003": {"name": "Sunita Patel",   "role": "Staff Nurse", "shift": "Night",     "password": "nurse123"},
        },
        "patients": [
            {
                "id": "P001", "name": "Anita Sharma", "age": 42, "room": "105",
                "condition": "Critical", "priority": 1, "assignedTo": "N001",
                "diet": [
                    {"id":"d1","meal":"Breakfast","desc":"Soft diet – porridge","done":False},
                    {"id":"d2","meal":"Lunch","desc":"Liquid diet","done":False},
                    {"id":"d3","meal":"Dinner","desc":"Light soup","done":False},
                ],
                "medicines": [
                    {"id":"m1","name":"Insulin","time":"12:00 PM","done":False},
                    {"id":"m2","name":"Antibiotic","time":"6:00 PM","done":False},
                    {"id":"m3","name":"Aspirin","time":"8:00 AM","done":False},
                ],
                "notes": []
            },
            {
                "id": "P002", "name": "Ramesh Kumar", "age": 55, "room": "203",
                "condition": "Stable", "priority": 2, "assignedTo": "N001",
                "diet": [
                    {"id":"d1","meal":"Breakfast","desc":"Oatmeal and fruit","done":False},
                    {"id":"d2","meal":"Lunch","desc":"Low salt meal","done":False},
                    {"id":"d3","meal":"Dinner","desc":"Light meal","done":False},
                ],
                "medicines": [
                    {"id":"m1","name":"Paracetamol","time":"8:00 AM","done":False},
                    {"id":"m2","name":"Metformin","time":"1:00 PM","done":False},
                ],
                "notes": []
            },
            {
                "id": "P003", "name": "Rahul Verma", "age": 30, "room": "208",
                "condition": "Normal", "priority": 3, "assignedTo": "N001",
                "diet": [
                    {"id":"d1","meal":"Breakfast","desc":"Regular breakfast","done":False},
                    {"id":"d2","meal":"Lunch","desc":"Normal diet","done":False},
                    {"id":"d3","meal":"Dinner","desc":"Regular dinner","done":False},
                ],
                "medicines": [
                    {"id":"m1","name":"Antibiotic","time":"6:00 PM","done":False},
                    {"id":"m2","name":"Vitamin C","time":"9:00 AM","done":False},
                ],
                "notes": []
            },
            {
                "id": "P004", "name": "Sunita Devi", "age": 67, "room": "112",
                "condition": "Critical", "priority": 1, "assignedTo": "N001",
                "diet": [
                    {"id":"d1","meal":"Breakfast","desc":"IV nutrition","done":False},
                    {"id":"d2","meal":"Lunch","desc":"IV nutrition","done":False},
                    {"id":"d3","meal":"Dinner","desc":"Liquid via tube","done":False},
                ],
                "medicines": [
                    {"id":"m1","name":"Morphine","time":"Every 4hrs","done":False},
                    {"id":"m2","name":"Ceftriaxone","time":"8:00 AM","done":False},
                    {"id":"m3","name":"Heparin","time":"Continuous","done":False},
                ],
                "notes": []
            },
            {
                "id": "P005", "name": "Mohan Lal", "age": 48, "room": "306",
                "condition": "Stable", "priority": 2, "assignedTo": "N001",
                "diet": [
                    {"id":"d1","meal":"Breakfast","desc":"Low fat diet","done":False},
                    {"id":"d2","meal":"Lunch","desc":"Heart diet","done":False},
                    {"id":"d3","meal":"Dinner","desc":"Low salt meal","done":False},
                ],
                "medicines": [
                    {"id":"m1","name":"Atorvastatin","time":"9:00 PM","done":False},
                    {"id":"m2","name":"Amlodipine","time":"8:00 AM","done":False},
                ],
                "notes": []
            },
        ],
        "wardTasks": [
            {"id":"w1","name":"Ward sanitation check","done":False},
            {"id":"w2","name":"Equipment inspection","done":False},
            {"id":"w3","name":"Shift report submission","done":False},
            {"id":"w4","name":"Staff meeting reminder","done":False},
            {"id":"w5","name":"Medicine stock count","done":False},
        ],
        "doctorNotes": [],
        "notifications": [
            {"type":"urgent","msg":"⚠️ Anita Sharma (Room 105) – Insulin due at 12:00 PM"},
            {"type":"info","msg":"📋 Ward sanitation check is pending"},
            {"type":"info","msg":"💊 Rahul Verma – Antibiotic due at 6:00 PM"},
            {"type":"success","msg":"✅ Ramesh Kumar medicine administered"},
        ],
        "transferredTasks": [],
        "wards": [
            {"name":"ICU","patients":12,"pending":18,"nurses":3,"critical":8,"score":95},
            {"name":"General Ward","patients":20,"pending":12,"nurses":5,"critical":2,"score":58},
            {"name":"Pediatrics","patients":8,"pending":8,"nurses":2,"critical":3,"score":72},
            {"name":"Maternity","patients":6,"pending":5,"nurses":2,"critical":0,"score":30},
            {"name":"Ortho","patients":10,"pending":10,"nurses":3,"critical":1,"score":55},
            {"name":"Cardiology","patients":9,"pending":14,"nurses":2,"critical":5,"score":88},
            {"name":"Neurology","patients":7,"pending":9,"nurses":2,"critical":4,"score":78},
            {"name":"Oncology","patients":11,"pending":16,"nurses":3,"critical":6,"score":85},
            {"name":"Emergency","patients":15,"pending":20,"nurses":4,"critical":9,"score":99},
            {"name":"Surgery","patients":8,"pending":7,"nurses":2,"critical":2,"score":50},
            {"name":"Nephrology","patients":6,"pending":6,"nurses":1,"critical":1,"score":45},
            {"name":"Psychiatry","patients":5,"pending":3,"nurses":1,"critical":0,"score":20},
        ]
    }


# ── AUTH ──────────────────────────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    body = request.json
    staff_id = (body.get('staffId') or '').strip().upper()
    password  = body.get('password', '')
    data = load()
    nurse = data['nurses'].get(staff_id)
    if nurse and nurse['password'] == password:
        return jsonify({"ok": True, "nurse": {"id": staff_id, **{k:v for k,v in nurse.items() if k!='password'}}})
    return jsonify({"ok": False, "error": "Invalid Staff ID or Password"}), 401


# ── NURSES ────────────────────────────────────────────────────────────────────
@app.route('/api/nurses', methods=['GET'])
def get_nurses():
    data = load()
    return jsonify([{"id": k, "name": v["name"], "shift": v["shift"]} for k, v in data['nurses'].items()])


# ── PATIENTS ──────────────────────────────────────────────────────────────────
@app.route('/api/patients', methods=['GET'])
def get_patients():
    data = load()
    assigned = request.args.get('assignedTo')
    pts = data['patients']
    if assigned:
        pts = [p for p in pts if p['assignedTo'] == assigned]
    return jsonify(pts)

@app.route('/api/patients/<pid>/diet/<did>', methods=['PATCH'])
def toggle_diet(pid, did):
    data = load()
    p = next((x for x in data['patients'] if x['id'] == pid), None)
    if not p: return jsonify({"error":"not found"}), 404
    d = next((x for x in p['diet'] if x['id'] == did), None)
    if not d: return jsonify({"error":"not found"}), 404
    d['done'] = request.json.get('done', d['done'])
    save(data)
    return jsonify(d)

@app.route('/api/patients/<pid>/medicines/<mid>', methods=['PATCH'])
def toggle_medicine(pid, mid):
    data = load()
    p = next((x for x in data['patients'] if x['id'] == pid), None)
    if not p: return jsonify({"error":"not found"}), 404
    m = next((x for x in p['medicines'] if x['id'] == mid), None)
    if not m: return jsonify({"error":"not found"}), 404
    m['done'] = request.json.get('done', m['done'])
    save(data)
    return jsonify(m)

@app.route('/api/patients/<pid>/notes', methods=['POST'])
def add_note(pid):
    data = load()
    p = next((x for x in data['patients'] if x['id'] == pid), None)
    if not p: return jsonify({"error":"not found"}), 404
    body = request.json
    note = {
        "text": body.get('text', ''),
        "nurse": body.get('nurse', ''),
        "time": datetime.now().strftime('%d/%m/%y, %I:%M %p')
    }
    p['notes'].append(note)
    # also push to doctorNotes
    data['doctorNotes'].append({
        "patient": p['name'], "room": p['room'],
        "condition": p['condition'], **note
    })
    # push notification
    data['notifications'].insert(0, {
        "type": "info",
        "msg": f"📝 New note for {p['name']} by {note['nurse']}"
    })
    save(data)
    return jsonify(note), 201


# ── WARD TASKS ────────────────────────────────────────────────────────────────
@app.route('/api/ward-tasks', methods=['GET'])
def get_ward_tasks():
    return jsonify(load()['wardTasks'])

@app.route('/api/ward-tasks/<tid>', methods=['PATCH'])
def toggle_ward_task(tid):
    data = load()
    t = next((x for x in data['wardTasks'] if x['id'] == tid), None)
    if not t: return jsonify({"error":"not found"}), 404
    t['done'] = request.json.get('done', t['done'])
    save(data)
    return jsonify(t)


# ── DOCTOR NOTES ──────────────────────────────────────────────────────────────
@app.route('/api/doctor-notes', methods=['GET'])
def get_doctor_notes():
    return jsonify(load()['doctorNotes'])


# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    return jsonify(load()['notifications'])

@app.route('/api/notifications', methods=['POST'])
def add_notification():
    data = load()
    n = request.json
    data['notifications'].insert(0, n)
    save(data)
    return jsonify(n), 201


# ── WARDS (heatmap) ───────────────────────────────────────────────────────────
@app.route('/api/wards', methods=['GET'])
def get_wards():
    return jsonify(load()['wards'])


# ── TASK TRANSFER ─────────────────────────────────────────────────────────────
@app.route('/api/transfer', methods=['POST'])
def transfer_tasks():
    data = load()
    body = request.json  # {fromNurse, toNurse, tasks:[{id,label}]}
    for t in body.get('tasks', []):
        data['transferredTasks'].append({
            "task": t['label'],
            "from": body.get('fromNurse'),
            "to":   body.get('toNurse'),
        })
    data['notifications'].insert(0, {
        "type": "info",
        "msg": f"🔄 {len(body.get('tasks',[]))} tasks transferred to {body.get('toNurse')}"
    })
    save(data)
    return jsonify({"ok": True})

@app.route('/api/transfer/received', methods=['GET'])
def received_tasks():
    data = load()
    to = request.args.get('to')
    tasks = [t for t in data['transferredTasks'] if t.get('to') == to]
    return jsonify(tasks)


# ── RESET (dev helper) ────────────────────────────────────────────────────────
@app.route('/api/reset', methods=['POST'])
def reset():
    save(get_default_data())
    return jsonify({"ok": True})


if __name__ == '__main__':
    app.run(debug=True, port=5000)

# AI Webhook Automated Fix Run ID: 23937898540
