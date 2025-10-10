import os

import google.generativeai as genai
import httpx
from db import get_db
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Form, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from models import QueryRequest
from schema import Query
from sqlalchemy.orm import Session

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


async def call_llm(prompt: str):
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text


PROMPT = """
You are an educational medical assistant. Based on the given symptoms, list possible conditions that I might have and which condition I am most probably afflicted by. List the next steps I should take for the same. Add a disclaimer with all that in mind.
"""


@app.get("/", response_class=JSONResponse)
async def index(req: Request):
    return {"message": "api is online"}


@app.post("/diagnose", response_class=JSONResponse)
async def diagnose(
    request: QueryRequest, db: Session = Depends(get_db)
):
    llm_text = await call_llm(PROMPT + "\n" + request.symptoms)
    q = Query(symptoms=request.symptoms, response=llm_text)
    db.add(q)
    db.commit()
    db.refresh(q)

    return JSONResponse(
        content={"symptoms": request.symptoms, "response": llm_text},
        status_code=200,
    )


@app.get("/history", response_class=JSONResponse)
async def history(req: Request, db: Session = Depends(get_db)):
    items = db.query(Query).order_by(Query.created_at.desc()).all()

    return JSONResponse(content={"response": jsonable_encoder(items)}, status_code=200)
