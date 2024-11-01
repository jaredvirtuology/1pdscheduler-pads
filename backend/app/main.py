from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .tightlock_client import test_connection


# Initialize FastAPI app
app = FastAPI(title="Connect API",
             description="A simple FastAPI server with a connect endpoint",
             version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/connect")
async def connect():
    return test_connection()

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)