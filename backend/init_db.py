"""Run this once to create the initial nursesync.db data file."""
import requests, sys

try:
    r = requests.post('http://localhost:5000/api/reset')
    print("✅ Database reset to defaults:", r.json())
except Exception as e:
    print("❌ Could not reach backend – make sure main.py is running.", e)
    sys.exit(1)
