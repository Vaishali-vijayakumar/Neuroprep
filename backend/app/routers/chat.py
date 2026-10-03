from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

router = APIRouter()

_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]
OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"]

class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    apiKey: Optional[str] = None
    provider: Optional[str] = "chatgpt" # "chatgpt" | "gemini"

class ChatResponse(BaseModel):
    text: str
    suggestedPrompts: List[str]
    modelUsed: str

SYSTEM_PROMPT = """You are NeuroCoach, an empathetic, supportive, and motivating best-friend placement mentor for college students preparing for software engineering and tech campus placements.

CORE BEHAVIOR & TONE:
1. Speak like a real, caring, supportive best friend using natural conversational language and friend slang (e.g. 'Yooo', 'Let's go', 'Man, that sucks', 'I hear you').
2. ZERO ROBOTIC HEADINGS: Never use section headings like 'Emotion Identified:', 'Perspective Shift:', 'Actionable Steps:', '3 Practical Ways', or dividers like '---'. Make it flow naturally like a real WhatsApp/Discord message from a mentor friend.
3. CONTEXT AWARE: Directly address the exact companies (Google, Amazon, TCS, Infosys, Zoho, etc.), specific interview rounds (final round, technical, HR, OA), and DSA topics (DP, Graphs, Trees, SQL) the user mentions.
4. EMOTIONAL SUPPORT:
   - When DOWN (sad, rejected, failed a test/round, anxious, imposter syndrome, overwhelmed): Validate their feelings with genuine empathy first. Reframe the situation with perspective (e.g. reaching a final round proves strong fundamentals; rejections happen to everyone before an offer). Give 2-3 gentle, realistic next steps.
   - When UP (solved problem, aced test, cleared interview round, got offer): Hype them up with genuine excitement, celebrate the milestone, and help them ride that confidence forward.
5. Provide 2-3 natural suggested follow-up prompt pills in a JSON block at the very end.

OUTPUT FORMAT:
[REPLY]
<your natural, human-like friend reply here>
[/REPLY]
[PROMPTS]
["Prompt 1", "Prompt 2", "Prompt 3"]
[/PROMPTS]
"""

@router.post("/message", response_model=ChatResponse)
async def chat_message(req: ChatRequest):
    user_text = req.message.strip()
    if not user_text:
        return ChatResponse(
            text="Hey! I'm right here with you. What's on your mind today — any coding breakthroughs, tough interviews, or doubts?",
            suggestedPrompts=["Feeling stressed about placements", "Solved a tricky coding problem", "How to stay motivated?"],
            modelUsed="default"
        )

    # 1. Try ChatGPT (OpenAI) if key is provided in request or in .env
    openai_key = (req.apiKey if req.apiKey and req.apiKey.startswith("sk-") else _OPENAI_API_KEY).strip()
    if openai_key and openai_key != "your_openai_api_key_here":
        try:
            openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if req.history:
                for msg in req.history[-8:]:
                    role = "user" if msg.sender == "user" else "assistant"
                    openai_messages.append({"role": role, "content": msg.text})
            openai_messages.append({"role": "user", "content": user_text})

            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": openai_messages,
                        "temperature": 0.8,
                        "max_tokens": 750
                    }
                )

                if resp.status_code == 200:
                    data = resp.json()
                    raw_out = data["choices"][0]["message"]["content"].strip()
                    reply_text, prompts = parse_reply_and_prompts(raw_out)
                    return ChatResponse(text=reply_text, suggestedPrompts=prompts, modelUsed="ChatGPT (GPT-4o-mini)")
        except Exception as e:
            print(f"ChatGPT error: {e}")

    # 2. Try Gemini
    gemini_key = _GEMINI_API_KEY
    if gemini_key and gemini_key != "your_gemini_api_key_here":
        history_lines = []
        if req.history:
            for msg in req.history[-6:]:
                role = "User" if msg.sender == "user" else "NeuroCoach"
                history_lines.append(f"{role}: {msg.text}")
        
        conversation_context = "\n".join(history_lines)
        prompt = f"""Conversation History:
{conversation_context}

User's Latest Message:
{user_text}

Respond as NeuroCoach (warm, human-like friend, deeply motivating, empathetic, zero robotic headings). Also suggest 3 short follow-up prompts the user could ask next.
Format your output strictly with [REPLY]...[/REPLY] and [PROMPTS]...[/PROMPTS]."""

        for model in GEMINI_MODELS:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=gemini_key)
                cfg = types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=750,
                    temperature=0.8
                )
                res = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=cfg
                )
                raw_out = res.text.strip()
                reply_text, prompts = parse_reply_and_prompts(raw_out)
                return ChatResponse(text=reply_text, suggestedPrompts=prompts, modelUsed=f"Gemini ({model})")
            except Exception as e:
                print(f"Gemini {model} error: {e}")
                continue

    raise HTTPException(status_code=503, detail="AI Provider currently unavailable")


def parse_reply_and_prompts(raw_out: str):
    reply_text = raw_out
    suggested_prompts = [
        "How should I prep for the next round?",
        "Help me analyze what happened",
        "Give me a quick 3-day recovery plan"
    ]
    
    if "[REPLY]" in raw_out and "[/REPLY]" in raw_out:
        reply_text = raw_out.split("[REPLY]")[1].split("[/REPLY]")[0].strip()
    
    if "[PROMPTS]" in raw_out and "[/PROMPTS]" in raw_out:
        prompts_part = raw_out.split("[PROMPTS]")[1].split("[/PROMPTS]")[0].strip()
        try:
            parsed = json.loads(prompts_part)
            if isinstance(parsed, list) and len(parsed) > 0:
                suggested_prompts = [str(p) for p in parsed[:3]]
        except Exception:
            pass

    return reply_text, suggested_prompts
