import os
import sqlite3
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import analysis modules
from models.stockout import get_stockout_risk
from models.slow_moving import get_slow_moving
from models.waste import get_waste_analysis
from models.performance import get_warehouse_performance

load_dotenv()

app = FastAPI(title="Inventory AI Microservice")

# CORS middleware for hackathon ease of use
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class InsightRequest(BaseModel):
    db_path: Optional[str] = None

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/insights")
async def get_insights(request: Optional[InsightRequest] = None):
    db_path = (request.db_path if request else None) or os.getenv("AI_DB_PATH")
    
    if not db_path:
        raise HTTPException(status_code=400, detail="Database path not provided in request or environment.")
    
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"Database file not found at: {db_path}")

    try:
        conn = sqlite3.connect(db_path)
        
        insights = {
            "stockout_risk": get_stockout_risk(conn),
            "slow_moving": get_slow_moving(conn),
            "waste_analysis": get_waste_analysis(conn),
            "warehouse_performance": get_warehouse_performance(conn),
            "timestamp": datetime.now().isoformat()
        }
        
        conn.close()
        return insights
        
    except sqlite3.Error as e:
        raise HTTPException(status_code=503, detail=f"Database connection error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
