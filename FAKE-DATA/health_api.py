from fastapi import FastAPI
import random
import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for ease of testing from browsers/frontends
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex='.*',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import socket

def get_local_ip():
    try:
        # Connect to an external server to get the interface IP (doesn't actually send data)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@app.on_event("startup")
async def startup_event():
    ip = get_local_ip()
    print(f"\n\n\033[92mINFO:     Server accessible at http://{ip}:8001\033[0m\n")

# Global variable to simulate accumulating steps
current_steps = 0
last_step_update = datetime.datetime.now()

def get_timestamp():
    return datetime.datetime.now().isoformat()

@app.get("/heart-beat")
def get_heart_beat():
    """Returns a random heart rate between 60 and 100 bpm."""
    # Simulate some realistic variance
    bpm = random.randint(60, 100)
    # Occasionally spike it up a bit or drop it down for realism
    if random.random() > 0.9:
        bpm = random.randint(100, 120)
    
    return {
        "heart_rate": bpm,
        "unit": "bpm",
        "timestamp": get_timestamp()
    }

@app.get("/blood-pressure")
def get_blood_pressure():
    """Returns a random blood pressure (Systolic/Diastolic)."""
    # Normalish range: Systolic 110-130, Diastolic 70-85
    systolic = random.randint(110, 135)
    diastolic = random.randint(70, 85)
    
    return {
        "systolic": systolic,
        "diastolic": diastolic,
        "unit": "mmHg",
        "timestamp": get_timestamp()
    }

@app.get("/step-count")
def get_step_count():
    """Returns an accumulating step count."""
    global current_steps, last_step_update
    
    now = datetime.datetime.now()
    # If it's a new day, reset steps? For simplicity, we'll just keep adding.
    # But let's verify if we want to simulate a reset or just simple accumulation.
    # For a simple demo, just add 0-10 steps every call if enough time passed,
    # or just add random steps simulating 'walking' since last call.
    
    # Let's add random steps (0 to 20) to simulate activity
    new_steps = random.randint(0, 15)
    current_steps += new_steps
    
    return {
        "steps": current_steps,
        "unit": "count",
        "timestamp": get_timestamp()
    }

@app.get("/all")
def get_all_metrics():
    """Returns all health metrics in one response."""
    return {
        "heart_beat": get_heart_beat(),
        "blood_pressure": get_blood_pressure(),
        "step_count": get_step_count(),
        "timestamp": get_timestamp()
    }

@app.get("/")
def read_root():
    return {"message": "Fake Health Data API is running. Use /heart-beat, /blood-pressure, or /step-count"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
